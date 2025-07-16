require('dotenv').config({ path: './config/.env' });
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const PhonePart = require('./models/PhonePart');

const MONGO_URI = process.env.MONGO_URI;

const scrapeParts = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const parts = [];

        const title = $('h1').first().text().trim();
        let model = title;
        let category = 'Reservedele'; // Default category

        if (title.toLowerCase().includes('batteri')) {
            category = 'Batterier';
            model = title.replace(/batteri/i, '').trim();
        } else if (title.toLowerCase().includes('skærm')) {
            category = 'Skærme';
            model = title.replace(/skærm/i, '').trim();
        } else if (title.toLowerCase().includes('tilbehør og reservedele')) {
            category = 'Reservedele';
            model = title.replace(/tilbehør og reservedele/i, '').trim();
        } else if (title.toLowerCase().includes('reservedele')) {
            category = 'Reservedele';
            model = title.replace(/reservedele/i, '').trim();
        }

        $('.item.product.product-item').each((i, el) => {
            const name = $(el).find('.product-item-link').text().trim();
            const variant = $(el).find('.variant-title').text().trim();
            const priceText = $(el).find('.price').first().text().trim();
            const price = parseFloat(priceText.replace(' kr.', '').replace(/\./g, '').replace(',', '.'));
            
            if (name && !isNaN(price)) {
                parts.push({
                    name: name,
                    variant: variant || 'Standard',
                    model: model,
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

const addParts = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Forbundet til database...');

    const urlsFilePath = path.join(__dirname, 'urls.txt');
    const urlsToScrape = fs.readFileSync(urlsFilePath, 'utf-8')
      .split('\n')
      .filter(url => url.trim() !== '' && !url.trim().startsWith('#'));


    const allParts = [];
    for (const url of urlsToScrape) {
        console.log(`Scraper fra: ${url}`);
        const scrapedParts = await scrapeParts(url);
        allParts.push(...scrapedParts);
        console.log(`Fandt ${scrapedParts.length} dele.`);
    }
    console.log(`Total antal dele fundet: ${allParts.length}`);

    // De-duplikering
    const uniquePartsMap = new Map();
    allParts.forEach(part => {
        const uniqueKey = `${part.name}-${part.variant}`;
        if (!uniquePartsMap.has(uniqueKey)) {
            uniquePartsMap.set(uniqueKey, part);
        }
    });
    const uniqueParts = Array.from(uniquePartsMap.values());
    console.log(`Antal unikke dele efter de-duplikering: ${uniqueParts.length}`);

    const exclusionKeywords = [
        'Cover', 
        'Beskyttelse til kameralinsen', 
        'Skærmbeskyttelse',
        'W13 Pro Eeprom Programmer'
    ];
    const filteredParts = uniqueParts.filter(part => 
        !exclusionKeywords.some(keyword => part.name.toLowerCase().includes(keyword.toLowerCase()))
    );
    console.log(`Antal dele efter filtrering: ${filteredParts.length}`);

    if (filteredParts.length > 0) {
        await PhonePart.deleteMany({});
        console.log('Fjernet eksisterende reservedele.');
        await PhonePart.insertMany(filteredParts);
        console.log('Alle nye reservedele tilføjet til databasen.');
    } else {
        console.log('Ingen nye reservedele fundet, databasen er ikke blevet ændret.');
    }

  } catch (error) {
    console.error('Fejl under tilføjelse af nye dele:', error);
  } finally {
    mongoose.connection.close();
    console.log('Databaseforbindelse lukket.');
  }
};

addParts(); 