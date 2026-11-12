const qaItems = [
  {
    question: "How do I track my package?",
    answer:
      "You can easily track your package using our online tracking system. Simply enter your tracking number on our website to get real-time updates on your delivery's status.",
  },
  {
    question: "What should I do if my package is damaged or lost?",
    answer:
      "If your package arrives damaged or is lost in transit, please contact us immediately. We will investigate the matter and arrange for a replacement or refund as per our policy.",
  },
  {
    question: "Can I change my delivery address after placing an order?",
    answer:
      "Yes, you can change your delivery address as long as the package has not been dispatched. Please contact our customer service team as soon as possible to make any changes.",
  },
  {
    question: "Are there any items that cannot be shipped?",
    answer:
      "Yes, there are certain restrictions on items that can be shipped due to safety and legal reasons. Please refer to our shipping policy or contact us for more information on prohibited items.",
  },
];

const accordionDiv = document.getElementById("accordion");


qaItems.forEach((qaItem) => {
  const questionText = qaItem.question;
  const answerText = qaItem.answer;

  const questionDiv = document.createElement("div");
  questionDiv.classList.add("accordion-question");
  questionDiv.textContent = questionText;

  const answerDiv = document.createElement("div");
  answerDiv.classList.add("accordion-answer");
  answerDiv.textContent = answerText;

  questionDiv.appendChild(answerDiv);

  questionDiv.addEventListener("click", () => {
    questionDiv.classList.toggle("active");
    answerDiv.classList.toggle("active");
  });

  accordionDiv.appendChild(questionDiv);
});

class DatabaseObject {
  toString() {
    throw new Error("Not implemented");
  }
}

class Product extends DatabaseObject {
  constructor(name, inventory) {
    super();
    this.name = name;
    this.inventory = inventory;
  }

  toString() {
    return `${this.name}: ${this.inventory} left in stock`;
  }

}

class Delivery extends DatabaseObject {
  constructor(params) {
    super();
    const {address, scheduledTime, product, quantity} = params
    this.address = address;
    this.scheduledTime = scheduledTime;
    this.product = product;
    this.quantity = quantity;
  }

  static create(params) {
    return new Delivery(params)
  }

  toString() {
    return `Delivering ${this.quantity} of ${this.product.name} to ${this.address} at ${this.scheduledTime}`;
  }
}

class ProductDAO {
  static seeds = [
    {
      name: "Apples",
      inventory: 100,
    },
    {
      name: "Bananas",
      inventory: 50,
    },
    {
      name: "Peaches",
      inventory: 70,
    },
  ];

  getAll() {
    throw new Error("Not Implemented");
  }

  getProductByName(name) {
    throw new Error("not implemented")
  }

  update(product) {
    throw new Error("Not Implemented");
  }
}

class SessionStorageProductDAO extends ProductDAO {
  constructor() {
    super();
    this.database = sessionStorage;
  }

  getAll() {
    const productsAsJSON = this.database.getItem("products");
    const productsData = productsAsJSON ? JSON.parse(productsAsJSON) : ProductDAO.seeds;
    return productsData.map((productData) => {
      const { name, inventory } = productData;
      return new Product(name, inventory);
    })
  }

  getProductByName(name) {
    const products = this.getAll();
    return products.find(product => product.name == name);
  }

  update(product) {
    const existingProducts = this.getAll();
    const indexToDelete = existingProducts.findIndex((productInList) => productInList.name == product.name);
    existingProducts.splice(indexToDelete, 1, product);
  }
}

class CookieStorageProductDAO extends ProductDAO {
  constructor(){
    super();
    this.database = document.cookie;
  }

  getAll() {
    const productsAsJSON = this.database.getItem("products");
    return productsAsJSON ? JSON.parse(productsAsJSON) : [];
  }

  update(product) {
    const existingProducts = this.getAll();
    const indexToDelete = existingProducts.findIndex((productInList) => productInList.name == product.name);
    existingProducts.splice(indexToDelete, 1, product);
  }
}

class DeliveryDAO {
  getAll() {
    throw new Error("Not implemented")
  }

  update(delivery) {
    throw new Error("Not implemented")
  }
}

class SessionStorageDeliveryDAO extends DeliveryDAO {
  constructor(){
    super();
    this.database = sessionStorage;
  }

  getAll(){
    const deliveriesInSessionStorage = this.database.getItem("deliveries");
    const deliveriesData = deliveriesInSessionStorage ? JSON.parse(deliveriesInSessionStorage) : [];
    return deliveriesData.map((deliveryData) => {
      return Delivery.create(deliveryData)
    });
  }

  update(delivery){
    const deliveries = this.getAll();
    deliveries.push(delivery);
    this.database.setItem("deliveries", JSON.stringify(deliveries));
  }
}

class CreateDeliveryService {
  constructor(productDAO, deliveryDAO) {
    this.productDAO = productDAO;
    this.deliveryDAO = deliveryDAO;
  }

CreateDelivery(productName, quantity, address, scheduledTime) {
  const product = this.productDAO.getProductByName(productName);
  const newInventory = product.inventory - quantity;
  product.inventory = newInventory;
  const deliveryData = {
    product,
    quantity,
    address,
    scheduledTime
  };
  this.deliveryDAO.update(Delivery.create(deliveryData));
  this.productDAO.update(product);
 }
}

const deliveryDAO = new SessionStorageDeliveryDAO();
const productDAO = new SessionStorageProductDAO();
const createDeliveryService = new CreateDeliveryService(productDAO, deliveryDAO);

const deliveryList = document.getElementById("deliveries-list");
const deliveries = deliveryDAO.getAll();
for(let i = 0; i < deliveries.length; i++){
  const delivery = deliveries[i];
  const deliveryLi = document.createElement("li");
  deliveryLi.textContent = delivery.toString();
  deliveryList.appendChild(deliveryLi);
}

const productNameSelect = document.querySelector("#deliveries form select");
const products = productDAO.getAll();
for(let i = 0; i < products.length; i++) {
  const product = products[i];
  const option = document.createElement("option");
  option.innerText = product.toString();
  option.setAttribute("value", product.name);
  productNameSelect.appendChild(option);
}