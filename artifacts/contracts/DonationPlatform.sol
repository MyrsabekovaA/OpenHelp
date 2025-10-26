// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationPlatform {
    // Структура для проекта
    struct Project {
        address owner;          // Владелец проекта
        string descriptionHash; // IPFS hash описания проекта
        string proofHash;       // IPFS hash доказательств (фото, документы)
        uint256 balance;        // Баланс проекта
    }

    // Mapping проектов по ID
    mapping(uint256 => Project) public projects;
    uint256 public nextProjectId = 1; // Счётчик для ID проектов

    // События для прозрачности
    event ProjectCreated(uint256 indexed projectId, address owner, string descriptionHash);
    event DonationReceived(uint256 indexed projectId, address donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed projectId, address owner, uint256 amount);
    event ProofUpdated(uint256 indexed projectId, string proofHash);

    // Функция создания проекта
    function createProject(string memory _descriptionHash) public {
        uint256 projectId = nextProjectId;
        projects[projectId] = Project({
            owner: msg.sender,
            descriptionHash: _descriptionHash,
            proofHash: "",
            balance: 0
        });
        nextProjectId++;
        emit ProjectCreated(projectId, msg.sender, _descriptionHash);
    }

    // Функция доната (payable)
    function donate(uint256 _projectId) public payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(projects[_projectId].owner != address(0), "Project does not exist");

        projects[_projectId].balance += msg.value;
        emit DonationReceived(_projectId, msg.sender, msg.value);
    }

    // Функция вывода средств (только владельцем для MVP)
    function withdraw(uint256 _projectId, uint256 _amount) public {
        require(projects[_projectId].owner == msg.sender, "Only owner can withdraw");
        require(_amount <= projects[_projectId].balance, "Insufficient balance");

        projects[_projectId].balance -= _amount;
        payable(msg.sender).transfer(_amount);
        emit FundsWithdrawn(_projectId, msg.sender, _amount);
    }

    // Функция обновления доказательств (только владельцем для MVP)
    function updateProof(uint256 _projectId, string memory _proofHash) public {
        require(projects[_projectId].owner == msg.sender, "Only owner can update proof");
        projects[_projectId].proofHash = _proofHash;
        emit ProofUpdated(_projectId, _proofHash);
    }

    // Вспомогательная функция для получения информации о проекте
    function getProject(uint256 _projectId) public view returns (address owner, string memory descriptionHash, string memory proofHash, uint256 balance) {
        Project memory proj = projects[_projectId];
        return (proj.owner, proj.descriptionHash, proj.proofHash, proj.balance);
    }
}