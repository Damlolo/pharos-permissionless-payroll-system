// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract RealFiPayroll {
    struct Stream {
        address employer;
        address worker;
        uint256 totalAmount;
        uint256 amountPerSecond;
        uint256 startTime;
        uint256 endTime;
        uint256 claimed;
    }

    IERC20 public immutable usdc;
    uint256 public nextStreamId;

    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public workerStreams;

    event InstantPayment(address indexed employer, address indexed worker, uint256 amount, string sourceChain, string destinationChain, bytes32 cctpBurnTxHash);
    event StreamOpened(uint256 indexed streamId, address indexed employer, address indexed worker, uint256 totalAmount, uint256 amountPerSecond, uint256 startTime, uint256 endTime);
    event StreamClaimed(uint256 indexed streamId, address indexed worker, uint256 amountClaimed);

    constructor(address usdcAddress) {
        usdc = IERC20(usdcAddress);
    }

    /// @notice Called after CCTP finalization to settle a one-shot payroll payment.
    function settleInstantPayment(
        address worker,
        uint256 amount,
        string calldata sourceChain,
        string calldata destinationChain,
        bytes32 cctpBurnTxHash
    ) external {
        require(amount > 0, "amount=0");
        require(usdc.transferFrom(msg.sender, worker, amount), "USDC transfer failed");
        emit InstantPayment(msg.sender, worker, amount, sourceChain, destinationChain, cctpBurnTxHash);
    }

    /// @notice Opens a per-second salary stream denominated in USDC.
    function openStream(address worker, uint256 totalAmount, uint256 durationSeconds) external returns (uint256 streamId) {
        require(worker != address(0), "worker=0");
        require(totalAmount > 0, "amount=0");
        require(durationSeconds > 0, "duration=0");

        uint256 amountPerSecond = totalAmount / durationSeconds;
        require(amountPerSecond > 0, "rate=0");

        require(usdc.transferFrom(msg.sender, address(this), totalAmount), "USDC transfer failed");

        streamId = nextStreamId++;
        streams[streamId] = Stream({
            employer: msg.sender,
            worker: worker,
            totalAmount: totalAmount,
            amountPerSecond: amountPerSecond,
            startTime: block.timestamp,
            endTime: block.timestamp + durationSeconds,
            claimed: 0
        });
        workerStreams[worker].push(streamId);

        emit StreamOpened(streamId, msg.sender, worker, totalAmount, amountPerSecond, block.timestamp, block.timestamp + durationSeconds);
    }

    function claimStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.worker, "only worker");

        uint256 elapsed = block.timestamp >= stream.endTime ? stream.endTime - stream.startTime : block.timestamp - stream.startTime;
        uint256 unlocked = elapsed * stream.amountPerSecond;

        if (unlocked > stream.totalAmount) unlocked = stream.totalAmount;

        uint256 claimable = unlocked - stream.claimed;
        require(claimable > 0, "nothing to claim");

        stream.claimed += claimable;
        require(usdc.transfer(stream.worker, claimable), "USDC transfer failed");

        emit StreamClaimed(streamId, stream.worker, claimable);
    }
}
