const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const auth = require('../middleware/auth');

// @route   POST api/scrape
// @desc    Scrape data from a Facebook Marketplace URL
// @access  Private
router.post('/', auth, async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ msg: 'URL is required' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Args for running in Docker
    });
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2' });

    const content = await page.content();
    const $ = cheerio.load(content);

    // --- Data Extraction Logic ---
    // Try to get title from Open Graph meta tags first
    let title = $('meta[property="og:title"]').attr('content');
    
    // Try to get description from Open Graph meta tags
    let description = $('meta[property="og:description"]').attr('content');

    const fullText = (title || '') + ' ' + (description || '');

    let storage = null;
    const storageMatch = fullText.match(/(\d{2,4})\s?GB/i);
    if (storageMatch) {
        storage = parseInt(storageMatch[1], 10);
    }

    let battery = null;
    const batteryMatch = fullText.match(/(?:batteritilstand|batteri|battery health)[^0-9]*(\d{1,3})%/i);
    if (batteryMatch) {
        battery = parseInt(batteryMatch[1], 10);
    }

    // Try to get image from Open Graph meta tags
    let image = $('meta[property="og:image"]').attr('content');

    // --- Price Extraction Logic ---
    let price = '0';
    let priceFound = false;

    // Method 1: Try structured data from meta tags (most reliable)
    const metaPrice = $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content');
    if (metaPrice) {
        price = metaPrice.replace(/\D/g, '');
        priceFound = true;
    }

    // Method 2: Fallback to a highly targeted visual scrape
    if (!priceFound) {
        // Find the main H1 title to use as an anchor point.
        const $titleElement = $('h1').first();
        let searchContext = $('[role="main"]'); // Fallback to main content area

        if ($titleElement.length) {
            // Go up two levels from the title to get its container block. This is a robust
            // way to select the main item's info box and exclude unrelated items.
            const $container = $titleElement.parent().parent();
            if ($container.length > 0) {
                searchContext = $container;
            }
        }

        // With our search area now tightly focused, find the first valid price.
        searchContext.find('span:contains("kr")').each((i, el) => {
            if ($(el).closest('s, del').length === 0) {
                // Replace all non-digit characters to get the pure price number
                const priceText = $(el).text().replace(/\D/g, '');
                if (priceText) {
                    price = priceText;
                    priceFound = true;
                    return false; // Stop searching as soon as we find the first price
                }
            }
        });
    }


    // If og:title was not found, try another common selector pattern for title
    if (!title) {
       title = $('h1 span').first().text();
    }


    res.json({
      name: title || '',
      bidAmount: price || '0',
      image: image || '',
      facebookDescription: description || '',
      storageGB: storage,
      batteryHealth: battery
    });

  } catch (err) {
    console.error('Scraping failed:', err.message);
    res.status(500).send('Server error during scraping');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

module.exports = router; 