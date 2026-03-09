const axios = require("axios");

const EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest";

/**
 * Converts an amount from one currency to another using real-time exchange rates.
 */
exports.convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) return amount;
    console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);

    const response = await axios.get(`${EXCHANGE_API_URL}/${fromCurrency}`);
    const exchangeRate = response.data.rates[toCurrency];

    if (!exchangeRate) throw new Error("Exchange rate not found.");

    return amount * exchangeRate;
  } catch (error) {
    console.error("Currency conversion error:", error.message);
    return amount; // Default to the original amount if conversion fails
  }
};
