require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20", // Убедитесь, что версия соответствует вашему контракту
  networks: {
    hardhat: {}, // Локальная сеть для тестов
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID", // Замените на свой Infura ключ
      accounts: ["YOUR_PRIVATE_KEY"] // Замените на приватный ключ MetaMask
    }
  }
};