// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CreditScoring {
    struct PaymentRecord {
        uint256 amount;
        uint256 timestamp;
        bool onTime;
    }

    mapping(address => PaymentRecord[]) public records;

    event PaymentRecorded(address indexed worker, uint256 amount, bool onTime);

    function recordPayment(address worker, uint256 amount, bool onTime) external {
        records[worker].push(PaymentRecord({amount: amount, timestamp: block.timestamp, onTime: onTime}));
        emit PaymentRecorded(worker, amount, onTime);
    }

    function computeScore(address worker) external view returns (uint256 score) {
        PaymentRecord[] memory history = records[worker];
        if (history.length == 0) return 300;

        uint256 onTimeCount;
        uint256 totalVolume;

        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].onTime) onTimeCount++;
            totalVolume += history[i].amount;
        }

        uint256 punctuality = (onTimeCount * 450) / history.length;
        uint256 longevity = history.length * 20;
        if (longevity > 150) longevity = 150;

        uint256 volume = totalVolume / 1e6;
        if (volume > 200) volume = 200;

        score = 300 + punctuality + longevity + volume;
        if (score > 850) score = 850;
    }
}
