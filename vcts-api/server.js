const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ===========================
   MSSQL CONFIG
=========================== */
const config = {
  user: "sa",
  password: "password@123",
  server: "192.168.9.25",
  database: "IERPDB",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

/* ===========================
   CREATE GLOBAL CONNECTION POOL
=========================== */
let pool;

sql.connect(config)
  .then(p => {
    pool = p;
    console.log("Connected to MSSQL");
  })
  .catch(err => console.error("DB Connection Failed:", err));

/* ===========================
   TEST ROUTE
=========================== */
app.get("/", (req, res) => {
  res.send("VCTS API Running");
});

/* =====================================================
   GET TRANSPORTERS
===================================================== */
app.get("/api/transporters", async (req, res) => {
  try {
    const result = await pool.request()
      .input("ou", sql.NVarChar, "24")
      .execute("IERPDB.cfsivcts.spTransporterList");

    const cleanedData = result.recordset.map(item => ({
      TransId: Object.values(item)[0],
      TransporterName: Object.values(item)[1]?.replace(/&nbsp;/g, " ")
    }));

    res.json(cleanedData);

  } catch (err) {
    console.error("Transporter SP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   GET VEHICLES
===================================================== */
app.get("/api/vehicles/:transId", async (req, res) => {
  try {
    const { transId } = req.params;

    const result = await pool.request()
      .input("transId", sql.NVarChar, transId)
      .input("Ou", sql.NVarChar, "24")
      .execute("IERPDB.cfsivcts.spTransporterVehicleList");

    const cleanedVehicles = result.recordset.map(item => ({
      VehicleNo: Object.values(item)[0],
      VehicleId: Object.values(item)[1]
    }));

    res.json(cleanedVehicles);

  } catch (err) {
    console.error("Vehicle SP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   GET VESSEL LIST  (NEW API ADDED)
===================================================== */
app.get("/api/vessels", async (req, res) => {
  try {

    const result = await pool.request()
      .input("ou", sql.NVarChar, "24")
      .execute("IERPDB.cfsivcts.spVesselList");

     const cleanedVessels = result.recordset.map(item => ({
      VesselId: Object.values(item)[0],  
      VesselName: Object.values(item)[1]?.replace(/&nbsp;/g, " ")
    }));
    res.json(cleanedVessels);

  } catch (err) {
    console.error("Vessel SP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* =====================================================
   GET CONTAINER LIST BASED ON VESSEL  (NEW)
===================================================== */
app.get("/api/containers/:vesselId", async (req, res) => {
  try {

    const { vesselId } = req.params;

    const result = await pool.request()
      .input("vesselId", sql.NVarChar, vesselId)
      .input("Ou", sql.NVarChar, "24")
      .input("secContId", sql.NVarChar, "")
      .execute("IERPDB.cfsivcts.spFirstContainerList");

    console.log("SP RESULT:", result.recordset);

    const cleanedContainers = result.recordset.map(item => ({
      ContainerNo: item["Container No"] 
    }));

    res.json(cleanedContainers);

  } catch (err) {
    console.error("Container SP ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===========================
   START SERVER
=========================== */
// app.listen(5000, () => {
//   console.log("Server running at http://localhost:5000/");
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});