const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");

const sqlite3 = require("sqlite3").verbose();
const { ethers } = require("ethers");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const calculateBiddingHash = (bidding) => {
  const biddingPacked = ethers.utils.solidityPack(
    [
      "address", // lender
      "address", // borrower
      "address", // erc721
      "uint256", // tokenId
      "address", // erc20
      "uint256", // amount
      "uint256", // listingExpiration
      "uint256", // biddingExpiration
      "uint256", // duration
    ],
    [
      bidding.lender,
      bidding.borrower,
      bidding.erc721,
      bidding.tokenId,
      bidding.erc20,
      bidding.amount,
      bidding.listingExpiration,
      bidding.biddingExpiration,
      bidding.duration,
    ]
  );
  const biddingHash = ethers.utils.solidityKeccak256(
    ["bytes"],
    [biddingPacked]
  );

  return biddingHash;
};

const server = http.createServer(app);
const db = new sqlite3.Database("./bidding.db");
db.run(
  "CREATE TABLE IF NOT EXISTS bidding(id TEXT, lender TEXT, borrower TEXT, erc721 TEXT, tokenId TEXT, erc20 TEXT, amount TEXT, listingExpiration TEXT, biddingExpiration TEXT, duration TEXT, signature TEXT)"
);

app.get("/", function (req, res) {
  res.send({
    message: "Welcome! I am a wizard who makes polyjuice.",
  });
});

app.post("/bidding", function (req, res) {
  const bidding = req.body;
  const id = calculateBiddingHash(bidding);

  db.serialize(() => {
    db.run(
      "INSERT INTO bidding(id,lender,borrower,erc721,tokenId,erc20,amount,listingExpiration,biddingExpiration,duration,signature) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        bidding.lender,
        bidding.borrower,
        bidding.erc721,
        bidding.tokenId,
        bidding.erc20,
        bidding.amount,
        bidding.listingExpiration,
        bidding.biddingExpiration,
        bidding.duration,
        bidding.signature,
      ],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
        return res.send({
          status: 200,
          message:
            "New `bidding` has been added into the database with id: " + id,
        });
      }
    );
  });
});

app.get("/bidding/:id", function (req, res) {
  db.serialize(() => {
    db.get(
      "SELECT * FROM bidding WHERE id =?",
      [req.params.id],
      function (err, bidding) {
        if (err) console.error(err.message);
        if (!bidding)
          return res.send({ status: 204, message: "No entry found" });

        return res.send({
          status: 200,
          message: "entry displayed successfully",
          bidding: bidding,
        });
      }
    );
  });
});

app.delete("/bidding/:id", function (req, res) {
  db.serialize(() => {
    db.run("DELETE FROM bidding WHERE id = ?", req.params.id, function (err) {
      if (err) {
        return res.send("Error encountered while deleting");
      }
      return res.send({
        message: "Entry deleted",
        status: 200,
      });
    });
  });
});

// //UPDATE
// app.get("/update/:id/:name", function (req, res) {
//   db.serialize(() => {
//     db.run(
//       "UPDATE emp SET name = ? WHERE id = ?",
//       [req.params.name, req.params.id],
//       function (err) {
//         if (err) {
//           res.send("Error encountered while updating");
//           return console.error(err.message);
//         }
//         res.send("Entry updated successfully");
//         console.log("Entry updated successfully");
//       }
//     );
//   });
// });

// // Closing the database connection.
// app.get("/close", function (req, res) {
//   db.close((err) => {
//     if (err) {
//       res.send("There is some error in closing the database");
//       return console.error(err.message);
//     }
//     console.log("Closing the database connection.");
//     res.send("Database connection successfully closed");
//   });
// });

server.listen(3000, function () {
  console.log("server is listening on port: 3000");
});
