var USER_ID;
var totalAmount = 0;
var goalAmount = 0;
///////////////////////createTransaction Function/////////////////////////////////////////
function createTransaction(obj) {
  const DATE_OBJ = new Date(obj.date);
  const SHORT_DATE = DATE_OBJ.toLocaleDateString();
  const SHORT_TIME = DATE_OBJ.toLocaleTimeString();
  const AMOUNT = obj.amount;
  const ID = obj.id;
  totalAmount += AMOUNT;
  const TRANSACTION = $(`<div></div>`)
    .attr("id", `transaction_${ID}`)
    .attr("class", "transaction")
    .append(
      $("<span></span>")
        .addClass("close-button")
        .text("X")
        .on("click", function () {
          const transactionId = $(this)
            .closest(".transaction")
            .attr("id")
            .replace("transaction_", "");
          console.log(transactionId);
          const amount = parseInt(
            $(this).siblings(".amount").text().replace("Amount: $", "")
          );
          console.log(amount);
          totalAmount -= amount;
          $("#savings").text(`Total: $${totalAmount}`);

          // Send DELETE request to remove transaction from the database
          fetch(`/transactions/${transactionId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("Transaction deleted successfully", data);
            })
            .catch((error) => {
              console.error("Error deleting transaction", error);
            });

          $(this).closest(".transaction").remove();
        })
    )
    .append($("<p></p>").attr("class", "amount").text(`Amount: $${AMOUNT}`))
    .append($("<p></p>").text(`Date: ${SHORT_DATE}`))
    .append($("<p></p>").text(`Time: ${SHORT_TIME}`));
  $("#transaction_history").append(TRANSACTION);
}
///////////////////////////////////////Show Piggy Bank Function////////////////////////////////////////////////
let showPiggyBank = (userId) => {
  //hide the div with id 'login-box'
  $("#login-box").hide();
  $("#piggy_bank").show();
  //make a get request to retrieve all transactions from user with USER_ID
  fetch(`/transactions/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("transactions", data);

      for (let i = 0; i < data.length; i++) {
        createTransaction(data[i]);
      }
      $("#savings").text(`Savings: $${totalAmount}`);
      $("#goal-input").val(goalAmount);
    });
};
///////////////////Login Button////////////////////////////
$("#login-button").on("click", () => {
  let username = $("#Username input").val();
  let password = $("#Password input").val();

  fetch(`/users/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("user data", data);
      const STORED_PASSWORD = data.password;
      USER_ID = data.id;
      goalAmount = Number(data.goal);

      if (password === STORED_PASSWORD) {
        showPiggyBank(USER_ID);
      } else {
        console.log("Password Input Was Incorrect");
      }
    });
});
//////////////////////Creating New Deposit Transaction///////////////
$("#deposit-button").on("click", () => {
  const amount = parseInt($("#trans_amount input").val());
  console.log(USER_ID);

  const transactionData = {
    type: "Deposit",
    amount: amount,
    user_id: USER_ID,
  };
  console.log(transactionData);

  fetch("/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Transaction created successfully", data);
      // Perform any additional operations after the transaction is created
      //create another transaction div here and add it into transaction history
      createTransaction(data);
      $("#savings").text(`Total: $${totalAmount}`);
    });
});

//////////////////////Creating New Withdrawal Transaction///////////////
$("#withdrawal-button").on("click", () => {
  const amount = -1 * parseInt($("#trans_amount input").val());

  console.log(USER_ID);

  const transactionData = {
    type: "Withdrawal",
    amount: amount,
    user_id: USER_ID,
  };
  console.log(transactionData);

  fetch("/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Transaction created successfully", data);
      // Perform any additional operations after the transaction is created
      //create another transaction div here and add it into transaction history
      createTransaction(data);
      $("#savings").text(`Total: $${totalAmount}`);
    });
});

///////////////Update GOal/////////////////////
$("#actual-goal").on("submit", (event) => {
  event.preventDefault();
  const goal = parseInt($("#goal-input").val());
  const goalObj = {
    goal: goal,
  };
  fetch(`/users/${USER_ID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalObj),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Goal Updated", data);
      goalAmount = goal;
      $("#goal-input").val(goalAmount);
    })
    .catch((error) => {
      console.error("Error updating goal amount", error);
    });
});
