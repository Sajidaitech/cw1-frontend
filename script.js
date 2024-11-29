import { books } from './store.js';

new Vue({
  el: '#app',
  data() {
    return {
      view: 'store', // Tracks the current view
      searchQuery: '', // Holds the search input value
      books: books, // Book data imported from store.js
      cart: [], // Cart items
      paymentInfo: {
        name: '',
        phone: '',
      },
      sortOrder: 'asc', // Sorting order (asc or desc)
      sortCriterion: 'subject', // Sorting criterion (e.g., subject, price, etc.)
      nameError: '', // Holds error message for name validation
      phoneError: '', // Holds error message for phone validation
    };
  },
  computed: {
    // Filter books based on the search query
    filteredBooks() {
      return this.books.filter((book) =>
        book.subject.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        book.location.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    // Sort filtered books based on selected criterion and order
    sortedBooks() {
      const sorted = [...this.filteredBooks];
      sorted.sort((a, b) => {
        let valueA = a[this.sortCriterion];
        let valueB = b[this.sortCriterion];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          valueA = valueA.toLowerCase();
          valueB = valueB.toLowerCase();
          return this.sortOrder === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        } else {
          return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        }
      });
      return sorted;
    },
    // Validates form inputs for payment submission
    isFormValid() {
      return !this.nameError && !this.phoneError && this.paymentInfo.name && this.paymentInfo.phone;
    },
  },
  methods: {
    // Validates name input: disallow numbers
    validateName() {
      if (/\d/.test(this.paymentInfo.name)) {
        this.nameError = 'Name cannot contain numbers.';
      } else {
        this.nameError = '';
      }
    },
    // Validates phone number: disallow letters
    validatePhone() {
      if (!/^\d*$/.test(this.paymentInfo.phone)) {
        this.phoneError = 'Phone number must contain only digits.';
      } else {
        this.phoneError = '';
      }
    },
    // Toggles the sorting order
    toggleSort() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    },
    // Generates star ratings based on book rating and availability
    generateStars(rating, availability) {
      return availability === 0 ? 0 : Math.round(rating);
    },
    // Sets the sorting criterion and optionally toggles the sort order
    setSortCriterion(criterion) {
      this.sortCriterion = criterion;
      this.toggleSort();
    },
    // Adds a book to the cart
    addToCart(book) {
      const existingItem = this.cart.find((item) => item.id === book.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.cart.push({ ...book, quantity: 1 });
      }
      book.availability--;
      this.saveCart();
    },
    // Removes one item from the cart
    removeOne(item) {
      const cartItem = this.cart.find((cartItem) => cartItem.id === item.id);
      if (cartItem.quantity > 1) {
        cartItem.quantity--;
      } else {
        this.cart = this.cart.filter((cartItem) => cartItem.id !== item.id);
      }
      const book = this.books.find((book) => book.id === item.id);
      if (book) book.availability++;
      this.saveCart();
    },
    // Clears the cart and restores book availability
    clearCart() {
      this.cart.forEach((item) => {
        const book = this.books.find((book) => book.id === item.id);
        if (book) book.availability += item.quantity;
      });
      this.cart = [];
      localStorage.removeItem('cart');
    },
    // Navigates to the cart view
    goToCart() {
      this.view = 'cart';
      this.loadCart();
    },
    // Navigates back to the store view
    goToStore() {
      this.view = 'store';
    },
    // Proceeds to the payment view
    proceedToPayment() {
      this.view = 'payment';
    },
    // Submits the payment if the form is valid
    submitPayment() {
      if (this.isFormValid) {
        alert(`Thank you, ${this.paymentInfo.name}. Your payment is successful!`);
        this.clearCart();
        this.view = 'store';
      } else {
        alert('Please correct the errors before submitting.');
      }
    },
    // Saves the cart to local storage
    saveCart() {
      localStorage.setItem('cart', JSON.stringify(this.cart));
    },
    // Loads the cart from local storage
    loadCart() {
      this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    },
  },
  watch: {
    // Watch for changes in the name input and validate in real time
    'paymentInfo.name'(newValue) {
      this.validateName();
    },
    // Watch for changes in the phone input and validate in real time
    'paymentInfo.phone'(newValue) {
      this.validatePhone();
    },
  },
});
