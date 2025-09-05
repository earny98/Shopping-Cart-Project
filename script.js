$(function () {
  let cart = {};
  let productsData = [];

  $.ajax({
    url: "products.json",
    method: "GET",
    dataType: "json",
    success: function (data) {
      productsData = data || [];
      renderProducts(productsData);
    },
    error: function (xhr, status, error) {
      console.error("Failed to load products.json:", error);
      $("#product-list").html(`
        <div class="col-12 text-center text-danger">
          ❌ Failed to load products. Please try again later.
        </div>
      `);
    },
  });
  function renderProducts(products) {
    $("#product-list").empty();
    products.forEach((product, index) => {
      const card = `
      <div class="col-sm-6 col-md-4 col-lg-3 mb-4 product-card"
           data-name="${product.name.toLowerCase()}">
        <div class="card h-100">
          <img src="${product.image}" class="card-img-top product-img" alt="${
        product.name
      }" data-index="${index}">
          <div class="card-body text-center">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text fw-bold">₹${product.price}</p>
            <div class="d-grid gap-2">
              <button class="btn btn-primary add-to-cart w-100">Add to Cart</button>
              <button class="btn btn-outline-danger remove-card w-100">Remove</button>
            </div>
          </div>
        </div>
      </div>
    `;
      $("#product-list").append(card);
    });
  }

  function updateCartCount() {
    const total = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    $("#cart-count").text(total);
  }

  function updateCartModal() {
    const $items = $("#cart-items").empty();
    let totalPrice = 0;

    Object.entries(cart).forEach(([name, item]) => {
      const subtotal = item.qty * item.price;
      totalPrice += subtotal;

      $items.append(`
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img src="${item.image}" alt="${name}" width="50" class="me-2">
            <div>
              <strong>${name}</strong><br>
              ₹${item.price} × ${item.qty} = ₹${subtotal.toFixed(2)}
            </div>
          </div>
          <div>
            <button class="btn btn-sm btn-success cart-plus" data-name="${name}">+</button>
            <button class="btn btn-sm btn-danger cart-minus" data-name="${name}">−</button>
          </div>
        </li>
      `);
    });

    $("#cart-total").text(totalPrice.toLocaleString("en-IN"));
  }

  function updateCartUI() {
    updateCartCount();
    updateCartModal();
  }

  function addByName(name, price, image) {
    if (!name) return;
    if (cart[name]) {
      cart[name].qty++;
    } else {
      cart[name] = { qty: 1, price: Number(price) || 0, image: image || "" };
    }
    updateCartUI();
  }

  function removeByName(name) {
    if (!name || !cart[name]) return;
    cart[name].qty--;
    if (cart[name].qty <= 0) delete cart[name];
    updateCartUI();
  }

  $(document).on("click", ".add-to-cart", function () {
    const $card = $(this).closest(".product-card");
    const name = $card.find(".card-title").text();
    const price =
      parseFloat($card.find(".card-text").text().replace("₹", "")) || 0;
    const image = $card.find("img").attr("src") || "";
    addByName(name, price, image);
  });

  $(document).on("click", ".remove-card", function () {
    const $card = $(this).closest(".product-card");
    const name = $card.find(".card-title").text();
    removeByName(name);
  });

  $(document).on("click", ".cart-plus", function () {
    const name = $(this).data("name");
    if (cart[name]) {
      addByName(name, cart[name].price, cart[name].image);
    } else {
      const p = productsData.find((p) => p.name === name);
      if (p) addByName(p.name, p.price, p.image);
    }
  });

  $(document).on("click", ".cart-minus", function () {
    const name = $(this).data("name");
    removeByName(name);
  });

  $("#search-bar").on("input", function () {
    const query = $(this).val().toLowerCase();
    $(".product-card").each(function () {
      const name = $(this).data("name");
      $(this).toggle(name.includes(query));
    });
  });
  $(document).on("click", "#nav-products", function () {
    $("#search-bar").val("");
    $(".product-card").show();
  });

  $(document).on("click", "#nav-products, #nav-home", function () {
    $("#search-bar").val("");
    $("#home").show();
  });

  $(document).on("click", ".product-img", function () {
    const index = $(this).data("index");
    const product = productsData[index];
    if (!product) return;
    $("#modal-title").text(product.name);
    $("#modal-image").attr("src", product.image);
    $("#modal-price").text(`₹${product.price}`);
    $("#modal-description").text(product.description);
  });

  $(document).on("click", "#checkout-btn", function () {
    if (Object.keys(cart).length === 0) return;
    cart = {};
    updateCartUI();
    $("#cartModal").modal("hide");

    const $msg = $("#order-message");
    $msg.removeClass("d-none");

    setTimeout(() => {
      $msg.addClass("d-none");
    }, 1000);
  });
});
