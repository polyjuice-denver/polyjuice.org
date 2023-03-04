const fs = require("fs");
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const sqlite3 = require("sqlite3").verbose();
const { ethers } = require("ethers");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

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
const db = new sqlite3.Database("./polyjuice.db");
db.run(
  "CREATE TABLE IF NOT EXISTS bidding(" +
    "id TEXT PRIMARY KEY, " +
    "lender TEXT, " +
    "borrower TEXT, " +
    "erc721 TEXT, " +
    "tokenId TEXT, " +
    "erc20 TEXT, " +
    "amount TEXT, " +
    "listingExpiration TEXT, " +
    "biddingExpiration TEXT, " +
    "duration TEXT, " +
    "signature TEXT)"
);
db.run(
  "CREATE TABLE IF NOT EXISTS child(" +
    "id TEXT PRIMARY KEY, " +
    "platform TEXT, " + // e.g., sandbox, decentraland, etc.
    "motherERC721 TEXT, " +
    "motherERC721Name TEXT, " +
    "childERC721 TEXT, " +
    "childERC721Name TEXT, " +
    "tokenId TEXT, " +
    "expiredAt TEXT, " + // if expiredAt is the zero, it means the child can be rented.
    "totalFee TEXT, " + // amount of erc20 token * rental duration
    "metadata TEXT)" // metadata (object <-> string)
);

app.get("/", function (req, res) {
  res.send({
    message: "Welcome! I am a wizard who makes polyjuice.",
  });
});

app.get("/bidding/from/:address", function (req, res) {
  const address = req.params.address;
  db.serialize(() => {
    db.all(
      "SELECT * FROM bidding b " +
        "LEFT JOIN child c ON (b.erc721 = c.childERC721 AND b.tokenId = c.tokenId) " +
        "WHERE (lender = ? OR borrower = ?) AND expiredAt > 0",
      [address.toLowerCase(), address.toLowerCase()],
      function (err, bidding) {
        if (err) console.error(err.message);
        if (!bidding)
          return res.send({ status: 204, message: "No entry found" });

        return res.send({
          status: 200,
          message: "entry displayed successfully",
          bidding,
        });
      }
    );
  });
});

app.get("/bidding/:erc721/:tokenId", function (req, res) {
  const erc721 = req.params.erc721;
  db.serialize(() => {
    db.all(
      "SELECT * FROM bidding WHERE erc721 = ? AND tokenId = ?",
      [erc721.toLowerCase(), req.params.tokenId],
      function (err, bidding) {
        if (err) console.error(err.message);
        if (!bidding)
          return res.send({ status: 204, message: "No entry found" });

        return res.send({
          status: 200,
          message: "entry displayed successfully",
          bidding,
        });
      }
    );
  });
});

app.get("/bidding/:id", function (req, res) {
  db.serialize(() => {
    db.get(
      "SELECT * FROM bidding WHERE id = ?",
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

app.post("/bidding", function (req, res) {
  const bidding = req.body;
  const id = calculateBiddingHash(bidding);

  db.serialize(() => {
    db.run(
      "INSERT INTO bidding(id,lender,borrower,erc721,tokenId,erc20,amount,listingExpiration,biddingExpiration,duration,signature) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
      [
        id,
        bidding.lender.toLowerCase(),
        bidding.borrower.toLowerCase(),
        bidding.erc721.toLowerCase(),
        bidding.tokenId,
        bidding.erc20.toLowerCase(),
        bidding.amount,
        bidding.listingExpiration,
        bidding.biddingExpiration,
        bidding.duration,
        bidding.signature,
      ],
      function (err) {
        if (err) {
          console.log(err.message);
          return res.send({
            status: 500,
            message: err.message,
          });
        }
        console.log(
          "New `bidding` has been added into the database with id: " + id
        );
        return res.send({
          status: 200,
          id,
          message:
            "New `bidding` has been added into the database with id: " + id,
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

app.get("/child/market", function (req, res) {
  db.serialize(() => {
    db.all(
      "SELECT c.*, c.expiredAt, b.duration, b.amount FROM child c " +
        "LEFT JOIN bidding b ON (" +
        "c.childERC721 = b.erc721 AND " +
        "c.tokenId = b.tokenId AND " +
        "b.borrower = '0x0000000000000000000000000000000000000000' AND " + // It means that lender has listed the child.
        "b.listingExpiration > strftime('%s', 'now')" + // It should be that the listing is not expired.
        ") GROUP BY c.id " +
        "ORDER BY RANDOM()",
      function (err, market) {
        if (err) {
          console.log(err.message);
          return res.send({
            status: 500,
            message: err.message,
          });
        }

        console.log("All child displayed successfully");
        return res.send({
          status: 200,
          market,
        });
      }
    );
  });
});

app.get("/child/:erc721/:tokenId", function (req, res) {
  const erc721 = req.params.erc721;
  db.serialize(() => {
    db.get(
      "SELECT * FROM child WHERE childERC721 = ? AND tokenId = ?",
      [erc721.toLowerCase(), req.params.tokenId],
      function (err, child) {
        if (err) console.error(err.message);
        if (!child) return res.send({ status: 204, message: "No entry found" });

        const metadata = JSON.parse(child.metadata);
        return res.send({
          status: 200,
          message: "entry displayed successfully",
          child: {
            ...child,
            metadata,
          },
        });
      }
    );
  });
});

app.get("/child/:id", function (req, res) {
  db.serialize(() => {
    db.get(
      "SELECT * FROM child WHERE id = ?",
      [String(req.params.id)],
      function (err, child) {
        if (err) console.error(err.message);
        if (!child) return res.send({ status: 204, message: "No entry found" });

        const metadata = JSON.parse(child.metadata);
        return res.send({
          status: 200,
          message: "entry displayed successfully",
          child: {
            ...child,
            metadata,
          },
        });
      }
    );
  });
});

app.put("/child/:erc721/:tokenId/rental/:expiredAt", function (req, res) {
  const erc721 = req.params.erc721;
  db.serialize(() => {
    db.run(
      "UPDATE child SET expiredAt = ? WHERE childERC721 = ? AND tokenId = ?",
      [req.params.expiredAt, erc721.toLowerCase(), req.params.tokenId],
      function (err) {
        if (err) {
          console.log(err.message);
          return res.send({ status: 500, message: err.message });
        }

        console.log(
          `entry(${erc721} #${req.params.tokenId}) modified successfully with ${req.params.expiredAt}`
        );
        return res.send({
          status: 200,
          message: `entry(${erc721} #${req.params.tokenId}) modified successfully with ${req.params.expiredAt}`,
        });
      }
    );
  });
});

app.post("/child/:num", function (req, res) {
  const data = req.body;
  const num = req.params.num; // the number of NFTs

  const platform = data.platform;
  const motherERC721 = data.motherERC721.toLowerCase();
  const motherERC721Name = data.motherERC721Name;
  const childERC721 = data.childERC721.toLowerCase();
  const childERC721Name = data.childERC721Name;

  db.serialize(() => {
    for (let i = 0; i < num; i++) {
      const id = (
        motherERC721Name +
        "-" +
        platform +
        "-" +
        String(i)
      ).toLowerCase();
      const metadata = JSON.stringify(
        JSON.parse(fs.readFileSync("./bayc/" + String(i)))
      );

      // TODO: check if id exists already
      try {
        console.log(
          "New `child` has been added into the database with tokenId: " + id
        );
        db.run(
          "INSERT INTO child(id,platform,motherERC721,motherERC721Name,childERC721,childERC721Name,tokenId,expiredAt,totalFee,metadata) " +
            "VALUES(?,?,?,?,?,?,?,?,?,?)",
          [
            id,
            platform,
            motherERC721,
            motherERC721Name,
            childERC721,
            childERC721Name,
            i,
            0,
            0,
            metadata,
          ]
        );
      } catch (err) {
        console.log(err.message);
        return res.send({
          status: 500,
          message: err.message,
        });
      }
    }

    return res.send({
      status: 200,
      message: `New collection(${
        motherERC721Name + " at " + platform
      }) has been added into the database`,
    });
  });
});

app.post("/mother", function (req, res) {
  const data = req.body;

  db.serialize(() => {
    fs.readdirSync("./bayc/").forEach((file) => {
      const platform = data.platform;
      const motherERC721 = data.motherERC721;
      const motherERC721Name = data.motherERC721Name;
      const childERC721 = data.childERC721;
      const childERC721Name = data.childERC721Name;
      const tokenId = data.tokenId;
      const expiredAt = data.expiredAt;
      const totalFee = data.totalFee;

      const id = motherContractName + "-" + platform + "-" + String(file);
      const metadata = JSON.stringify(
        JSON.parse(fs.readFileSync("./bayc/" + String(file)))
      );
      db.run(
        "INSERT INTO child(id,platform,motherContract,contract,metadata) VALUES(?,?,?,?,?)",
        [id, platform, motherContract, contract, metadata]
      );
    });

    return res.send({
      status: 200,
      message: `New ${child} has been added into the database`,
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
