// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')

contract('SupplyChain', function(accounts) {
    // Set different states
    const _Harvested = 0;
    const _Processed = 1;
    const _Packed = 2;
    const _ForSale = 3;
    const _Sold = 4;
    const _Shipped = 5;
    const _Received = 6;
    const _Purchased = 7;
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.toWei(1, "ether")
    var itemState = 0
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const emptyAddress = '0x00000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    // create Item
    function createExpectedItem() {
        var result = {
            itemSKU: sku,
            itemUPC: upc,
            ownerID: originFarmerID,
            originFarmerID: originFarmerID,
            originFarmName: originFarmName,
            originFarmInformation: originFarmInformation,
            originFarmLatitude: originFarmLatitude,
            originFarmLongitude: originFarmLongitude,
            productID: productID,
            productNotes: productNotes,
            productPrice: productPrice,
            itemState: itemState,
            distributorID: emptyAddress,
            retailerID: emptyAddress,
            consumerID: emptyAddress
        };
        return result;
    }

    function assetItemsAreEqual(item, expectedItem) {
       assert.equal(item.itemSKU, expectedItem.itemSKU, 'Error: Invalid item SKU');
       assert.equal(item.itemUPC, expectedItem.itemUPC, 'Error: Invalid item UPC');
       assert.equal(item.ownerID, expectedItem.ownerID, 'Error: Missing or Invalid ownerID');
       assert.equal(item.originFarmerID, expectedItem.originFarmerID, 'Error: Missing or Invalid originFarmerID');
       assert.equal(item.originFarmName, expectedItem.originFarmName, 'Error: Missing or Invalid originFarmName');
       assert.equal(item.originFarmInformation, expectedItem.originFarmInformation, 'Error: Missing or Invalid originFarmInformation');
       assert.equal(item.originFarmLatitude, expectedItem.originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude');
       assert.equal(item.originFarmLongitude, expectedItem.originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude');
       assert.equal(item.itemState, expectedItem.itemState, 'Error: Invalid item State');
       assert.equal(item.distributorID, expectedItem.distributorID, 'Error: Invalid item State dist');
       assert.equal(item.retailerID, expectedItem.retailerID, 'Error: Invalid item State retail');
       assert.equal(item.consumerID, expectedItem.consumerID, 'Error: Invalid item State consum');
    }

    // fetching item from supply chain
    async function fetchItemFromSupplyChain(supplyChain, upc, account = ownerID ) {
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc, {from: account});
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc, {from: account});
        const resultBufferThree = await supplyChain.fetchItemBufferThree.call(upc, {from: account});
        var result = {
            itemSKU: resultBufferOne[0],
            itemUPC: resultBufferOne[1],
            ownerID: resultBufferOne[2],
            originFarmerID: resultBufferOne[3],
            originFarmName: resultBufferOne[4],
            originFarmInformation: resultBufferOne[5],
  
            originFarmLatitude: resultBufferTwo[2],
            originFarmLongitude: resultBufferTwo[3],
            productID: resultBufferTwo[4],
            productNotes: resultBufferTwo[5],
            productPrice: resultBufferTwo[6],
  
            itemState: resultBufferThree[2],
            distributorID: resultBufferThree[3],
            retailerID: resultBufferThree[4],
            consumerID: resultBufferThree[5]
        };
        return result;
    }

    // 1st Test
    it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        await supplyChain.addFarmer(originFarmerID)

        var expectedItem = createExpectedItem();
        
        // Declare and Initialize a variable for event
        var eventEmitted = false
        
        // Watch the emitted event Harvested()
        var event = supplyChain.Harvested()
        await event.watch((err, res) => {
            eventEmitted = true
        })

        // Mark an item as Harvested by calling function harvestItem()
        await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes)

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
        const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)

        // Verify the result set
        assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU')
        assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC')
        assert.equal(resultBufferOne[2], originFarmerID, 'Error: Missing or Invalid ownerID')
        assert.equal(resultBufferOne[3], originFarmerID, 'Error: Missing or Invalid originFarmerID')
        assert.equal(resultBufferOne[4], originFarmName, 'Error: Missing or Invalid originFarmName')
        assert.equal(resultBufferOne[5], originFarmInformation, 'Error: Missing or Invalid originFarmInformation')
        assert.equal(resultBufferOne[6], originFarmLatitude, 'Error: Missing or Invalid originFarmLatitude')
        assert.equal(resultBufferOne[7], originFarmLongitude, 'Error: Missing or Invalid originFarmLongitude')
        assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State')
        assert.equal(eventEmitted, true, 'Invalid event emitted')        
    })    

    // 2nd Test
    it("Testing smart contract function processItem() that allows a farmer to process coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        // Declare and Initialize a variable for event
        var expectedItem = createExpectedItem();
        // Watch the emitted event Processed()
        expectedItem.itemState = _Processed;
        // Mark an item as Processed by calling function processtItem()
        var lProcessed = await supplyChain.processItem(
            expectedItem.itemUPC,
            {from: expectedItem.originFarmerID}
        );
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        var item = await fetchItemFromSupplyChain(supplyChain, expectedItem.itemUPC);
        // Verify the result set
        assetItemsAreEqual(item, expectedItem);
    })    

    // 3rd Test
    it("Testing smart contract function packItem() that allows a farmer to pack coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        // Declare and Initialize a variable for event
        var expectedItem = createExpectedItem();
        // Watch the emitted event Packed()
        expectedItem.itemState = _Packed;
        // Mark an item as Packed by calling function packItem()
        var lPacked = await supplyChain.packItem(
            expectedItem.itemUPC,
            {from: expectedItem.originFarmerID}
        );
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        var item = await fetchItemFromSupplyChain(supplyChain, expectedItem.itemUPC);
        // Verify the result set
        assetItemsAreEqual(item, expectedItem);
    })    

    // 4th Test
    it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        var expectedItem = createExpectedItem();
        // Watch the emitted event ForSale()
        expectedItem.itemState = _ForSale;
        // Mark an item as ForSale by calling function sellItem()
        var lForSale = await supplyChain.sellItem(
            expectedItem.itemUPC,
            expectedItem.productPrice,
            {from: expectedItem.originFarmerID}
        );
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        var item = await fetchItemFromSupplyChain(supplyChain, expectedItem.itemUPC);
        // Verify the result set
        assetItemsAreEqual(item, expectedItem);
    })    

    // 5th Test
    it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        await supplyChain.addDistributor(distributorID);
        // Declare and Initialize a variable for event
        var expectedItem = createExpectedItem();
        // Watch the emitted event Sold()
        expectedItem.itemState = _Sold;
        expectedItem.ownerID = distributorID;
        expectedItem.distributorID = distributorID;
        // Mark an item as Sold by calling function buyItem()
        var lSold = await supplyChain.buyItem(
            expectedItem.itemUPC,
            {from: distributorID, value: expectedItem.productPrice}
        );
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        var item = await fetchItemFromSupplyChain(supplyChain, expectedItem.itemUPC);
        // Verify the result set
        assetItemsAreEqual(item, expectedItem);
    })    

    // 6th Test
    it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        // Declare and Initialize a variable for event
        var expectedItem = createExpectedItem();
        // Watch the emitted event Shipped()
        expectedItem.itemState = _Shipped;
        expectedItem.ownerID = distributorID;
        expectedItem.distributorID = distributorID;
        // Mark an item as Sold by calling function buyItem()
        var lShipped = await supplyChain.shipItem(
            expectedItem.itemUPC,
            {from: distributorID }
        );
        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        var item = await fetchItemFromSupplyChain(supplyChain, expectedItem.itemUPC);
        // Verify the result set
        assetItemsAreEqual(item, expectedItem);
    })    

    // 7th Test
    it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        
        
        // Watch the emitted event Received()
        

        // Mark an item as Sold by calling function buyItem()
        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        

        // Verify the result set
             
    })    

    // 8th Test
    it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async() => {
        const supplyChain = await SupplyChain.deployed()
        
        // Declare and Initialize a variable for event
        
        
        // Watch the emitted event Purchased()
        

        // Mark an item as Sold by calling function buyItem()
        

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        

        // Verify the result set
        
    })    

    // 9th Test
    it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        
        
        // Verify the result set:
        
    })

    // 10th Test
    it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async() => {
        const supplyChain = await SupplyChain.deployed()

        // Retrieve the just now saved item from blockchain by calling function fetchItem()
        
        
        // Verify the result set:
        
    })

});

