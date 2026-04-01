// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract InvoiceNFT {
    struct Invoice {
        address worker;
        address payer;
        uint256 amount;
        string memo;
        bool paid;
    }

    string public name = "RealFi Payroll Invoice";
    string public symbol = "RFINV";

    uint256 public nextTokenId;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => Invoice) public invoiceData;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event InvoiceMinted(uint256 indexed tokenId, address indexed worker, address indexed payer, uint256 amount, string memo);
    event InvoiceMarkedPaid(uint256 indexed tokenId);

    function mintInvoice(address payer, uint256 amount, string calldata memo) external returns (uint256 tokenId) {
        require(payer != address(0), "payer=0");
        require(amount > 0, "amount=0");

        tokenId = nextTokenId++;
        ownerOf[tokenId] = msg.sender;
        balanceOf[msg.sender] += 1;
        invoiceData[tokenId] = Invoice({
            worker: msg.sender,
            payer: payer,
            amount: amount,
            memo: memo,
            paid: false
        });

        emit Transfer(address(0), msg.sender, tokenId);
        emit InvoiceMinted(tokenId, msg.sender, payer, amount, memo);
    }

    function markPaid(uint256 tokenId) external {
        Invoice storage invoice = invoiceData[tokenId];
        require(msg.sender == invoice.payer, "only payer");
        invoice.paid = true;
        emit InvoiceMarkedPaid(tokenId);
    }
}
