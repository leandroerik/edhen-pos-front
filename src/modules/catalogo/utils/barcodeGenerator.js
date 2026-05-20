const calculateCheckDigit = (code) => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
};

export const generateBarcode = () => {
  const randomPart = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');
  return randomPart + calculateCheckDigit(randomPart);
};

export const formatBarcode = (code) => {
  if (!code || code.length !== 13) return code;
  return `${code.substring(0, 4)}-${code.substring(4, 8)}-${code.substring(8, 12)}-${code[12]}`;
};
