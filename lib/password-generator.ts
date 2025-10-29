/**
 * Generate a secure random password
 * Format: 3 words + 2 numbers (e.g., "Blue-Sky-Moon-42")
 */
export function generatePassword(): string {
  const words = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
    'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
    'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
    'Xray', 'Yankee', 'Zulu', 'Blue', 'Red', 'Green', 'Yellow', 'Purple',
    'Orange', 'Pink', 'Brown', 'Gray', 'Black', 'White', 'Silver', 'Gold',
    'Sky', 'Ocean', 'River', 'Mountain', 'Forest', 'Desert', 'Valley', 'Peak',
  ];

  // Pick 3 random words
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const word3 = words[Math.floor(Math.random() * words.length)];

  // Generate 2 random numbers
  const num = Math.floor(Math.random() * 100);

  return `${word1}-${word2}-${word3}-${num}`;
}
