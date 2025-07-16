require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const PhonePart = require('./models/PhonePart');

const MONGO_URI = process.env.MONGO_URI;

// List of URLs to scrape from phone-parts.dk
const urlsToScrape = [
    'https://phone-parts.dk/reparation-og-reservedele/iphone-11-pro-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-11-pro-max-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-11-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-12-mini-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-12-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-12-pro-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-12-pro-max-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-13-mini-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-13-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-13-pro-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-13-pro-max-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-14-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-14-plus-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-14-pro-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-14-pro-max-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-xr-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-xs-max-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-xs-reservedele',
    'https://phone-parts.dk/reparation-og-reservedele/iphone-x-reservedele',
];

const scrapeParts = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const parts = [];

        const category = $('.headline-icon-text h1.text-primary-color').text().trim().replace(' Reservedele', '');

        $('.product-list-item').each((i, el) => {
            const name = $(el).find('h4 a').text().trim();
            const variant = $(el).find('.variant-title').text().trim();
            const priceText = $(el).find('.product-price-container .price').text().trim();
            const price = parseFloat(priceText.replace(' kr.', '').replace(',', '.'));
            
            if (name && !isNaN(price)) {
                parts.push({
                    name: name,
                    variant: variant || 'Standard',
                    category: category,
                    price: price,
                });
            }
        });
        return parts;
    } catch (error) {
        console.error(`Fejl ved scraping af ${url}:`, error);
        return [];
    }
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Forbundet til database...');

    console.log('Starter scraping...');
    const allParts = [];
    for (const url of urlsToScrape) {
        console.log(`Scraper fra: ${url}`);
        const scrapedParts = await scrapeParts(url);
        allParts.push(...scrapedParts);
        console.log(`Fandt ${scrapedParts.length} dele.`);
    }
    console.log(`Total antal dele fundet: ${allParts.length}`);

    if (allParts.length > 0) {
        await PhonePart.deleteMany({});
        console.log('Fjernet eksisterende reservedele.');
        
        await PhonePart.insertMany(allParts);
        console.log('Alle nye reservedele tilføjet til databasen.');
    } else {
        console.log('Ingen nye reservedele fundet, databasen er ikke blevet ændret.');
    }

  } catch (error) {
    console.error('Fejl under seeding af database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Databaseforbindelse lukket.');
  }
};

seedDB(); 