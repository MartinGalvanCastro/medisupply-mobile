# Inventory
- Can be accessed by seller and client
- Show inventory products
- Can filter per product SKU, or warehouse

- Should show products in a list
- Row layout can be a card, or something easily readable
- We should be able to click on those cards
- When cards are tapped, should open a dialog, or navigate to a new screen with product details
- Can add this products to the cart, by any quantity
- quantity greater than 0


# Cart
- Can be accessed by seller and client
- Shows a list of products added from the inventory to the cart, and their quantity
- Should show a subtotal per product, and a total price of the whole cart
- Can modify the cart (Change quantity of an specific product, remove a product at all)

- If seen from a client, only see list of added products, and buy button
- If seen by a seller, must link it to a client (Client id) with a dropdown, and could link it to a visit (Should be a visit for that specific client)


# Clients
- Can be accessed only by seler
- Shows a list of clients 
- When click on a client, should go to the speicifc screen of the client, to see the info of him

# Client Detail
- Can be accessed only by seller
- Detail info for the client
- Should contain a button to Schedule a metting


# Schedule a Meeting Screen
- Can be accessed only by seller
- Form for creating a meeting
- we can not schedule a meeting for the same day or past days


# Visits Screen
- Can be accessed only by seller
- Shows a list of visits scheduled for today, in asc chronollolically
- SHows where the meetings are, which which client


# Visit details screenåß
- Can be accessed only by seller
- Shows the detail information of the meeting
- Has a button for updating meeting status (To cancelled, or completed)
- Can update notes when updating status
- If marked as completed, should send to upload meeting evidece

# Upload notes screen
- Can be accessed only by seller
- Can take/upload photos and videos
- A button to upload once the phots and videos are loaded in memory, or where needed and ready for upload


# Orders 
- Can be accessed only by clients
- List of orders, should display status of order, order id, and delivery date
- If pressed, go to order detail screen, where it displays what info does the order contains, and the shipment info like shipment Id, vehicule plate number, and shipment status(planned, in progress, completed, cancelled)
- For mocks. Deliveries are set at most 2 days after the order creation
- Button for filtering orders that are on the delivery date is on the past


