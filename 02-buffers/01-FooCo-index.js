// FooCo's main script.
//
// FooCo takes orders for multiple kinds of widgets from customers and
// fulfills them.  Each widget may be in a different fulfillment center, so
// this script breaks the order apart, and requests widgets from the
// right fulfillment centers.
//
// All requests are purchase orders with this binary format:
//
// +--------------------------+--------------------------+
// |                  Order ID (8 bytes)                 |
// +--------------------------+--------------------------+
// |   Widget Type (4 bytes)  |    Quantity (4 bytes)    |
// +--------------------------+--------------------------+
//                           ...
// +--------------------------+--------------------------+
// |   Widget Type (4 bytes)  |    Quantity (4 bytes)    |
// +--------------------------+--------------------------+
'use strict';


function WidgetRouter(dispatchTable) {
  this._dispatchTable = dispatchTable;
}
WidgetRouter.prototype.fulfillOrder = function(orderId, items) {
  for (var i = 0; i < items.length; ++i) {
    var widget = items[i].widget, quantity = items[i].quantity;
    var center = this._dispatchTable[widget];
    if (!center) {
      var e = new Error('No fulfillment center for widget type ' + widget);
      e.widget = widget;
      throw e;
    }
    center.fulfillOrder(widget, quantity, orderId);
  }
}

function FulfillmentCenter(id) {
  this._id = id;
}
FulfillmentCenter.prototype.fulfillOrder = function(widget, quantity, orderId) {
  console.log('Center %s: %d widgets of type %d ordered (Order #%d)',
              this._id, quantity, widget, orderId);
};

var north = new FulfillmentCenter('North');
var east = new FulfillmentCenter('East');
var south = new FulfillmentCenter('South');
var west = new FulfillmentCenter('West');
var widgetRoutes = { 0 : north, 1: north, 2: south, 3: west, 4: east };
var router = new WidgetRouter(widgetRoutes);

router.fulfillOrder(12345, [ {'widget': 4, 'quantity': 1 },
                             {'widget': 2, 'quantity': 11 } ]);
