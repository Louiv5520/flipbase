import React from 'react';
import './AboutUsPage.css';

const AboutUsPage = () => {
  return (
    <div className="about-us-container">
      <div className="about-us-header">
        <h1>Om Flipbase</h1>
        <p className="about-us-subtitle">Vores mission er at gøre teknologi tilgængeligt og bæredygtigt for alle.</p>
      </div>
      <div className="about-us-content">
        <div className="about-us-text">
          <h2>Hvem er vi?</h2>
          <p>
            Flipbase blev grundlagt i 2023 med en vision om at revolutionere markedet for brugt elektronik. Vi er et team af passionerede teknologientusiaster, der tror på, at en brugt telefon kan være lige så god som en ny. Vi har specialiseret os i at istandsætte iPhones til de højeste standarder, så du kan få en telefon, der ikke kun er god for din pengepung, men også for planeten.
          </p>
          <h2>Vores Proces</h2>
          <p>
            Hver eneste telefon, der kommer gennem vores døre, gennemgår en omhyggelig 52-punkts inspektion og istandsættelsesproces. Vores erfarne teknikere udskifter slidte dele, sikrer batteriets sundhed og garanterer, at hver enhed lever op til vores strenge kvalitetskrav. Vi er så sikre på vores arbejde, at vi tilbyder 12 måneders garanti på alle vores telefoner.
          </p>
          <h2>Vores Værdier</h2>
          <ul>
            <li><strong>Kvalitet:</strong> Kompromisløs kvalitet i hver eneste enhed.</li>
            <li><strong>Bæredygtighed:</strong> At give elektronik et nyt liv er kernen i alt, hvad vi gør.</li>
            <li><strong>Tillid:</strong> Gennemsigtighed og ærlighed over for vores kunder er vores højeste prioritet.</li>
          </ul>
        </div>
        <div className="about-us-image-container">
          <img src="https://images.unsplash.com/photo-1554495522-7965f7462d73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Vores værksted" className="about-us-image" />
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage; 