import { useState, useEffect } from "react";
import "./App.css";

function App() {

  const [formData, setFormData] = useState({
    operationType: "",
    transporterType: "",
    transporterName: "",
    vehicleNo: "",
    vesselName: "",
    containerNo: ""
  });

  const [transporters, setTransporters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [containers, setContainers] = useState([]);   // ✅ NEW STATE

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    error: false
  });

  /* =====================================================
     LOAD VESSEL LIST ON PAGE LOAD
  ===================================================== */
  useEffect(() => {
    fetch("http://localhost:5000/api/vessels")
      .then(res => res.json())
      .then(data => {
        console.log("Vessel API Response:", data);
        setVessels(data);
      })
      .catch(err => console.error("Vessel load error:", err));
  }, []);

  const handleChange = async (e) => {
    let { name, value } = e.target;

    if (name === "vehicleNo" || name === "containerNo") {
      value = value.toUpperCase();
    }

    /* =========================
       TRANSPORT TYPE LOGIC
    ========================= */
    if (name === "transporterType") {

      if (value === "Own Transport") {
        setTransporters([]);
        setVehicles([]);
        setFormData({
          ...formData,
          transporterType: value,
          transporterName: "ECCT TRANSPORT",
          vehicleNo: ""
        });
        return;
      }

      if (value === "Others") {
        fetch("http://localhost:5000/api/transporters")
          .then(res => res.json())
          .then(data => setTransporters(data))
          .catch(err => console.error("Transporter load error:", err));
      }
    }

    /* =========================
       TRANSPORTER SELECTION
    ========================= */
    if (name === "transporterName") {

      setVehicles([]);

      if (value) {
        fetch(`http://localhost:5000/api/vehicles/${value}`)
          .then(res => res.json())
          .then(data => {
            console.log("Vehicle API Response:", data);
            setVehicles(data);
          })
          .catch(err => console.error("Vehicle load error:", err));
      }
    }

    /* =========================
      NEW: VESSEL SELECTION → LOAD CONTAINERS
    ========================= */
    if (name === "vesselName") {

      setContainers([]);   // clear previous containers

      if (value) {
        fetch(`http://localhost:5000/api/containers/${value}`)
          .then(res => res.json())
          .then(data => {
            console.log("Container API Response:", data);
            setContainers(data);
          })
          .catch(err => console.error("Container load error:", err));
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const showPopup = (message, error = false) => {
    setPopup({ show: true, message, error });
    setTimeout(() => {
      setPopup({ show: false, message: "", error: false });
    }, 3000);
  };

  const validateForm = async () => {

    const {
      operationType,
      transporterType,
      transporterName,
      vehicleNo,
      vesselName,
      containerNo
    } = formData;

    if (
      !operationType ||
      !transporterType ||
      !transporterName ||
      !vehicleNo ||
      !vesselName ||
      !containerNo
    ) {
      showPopup("All fields are required!", true);
      return;
    }

    const vehicleNoPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/;
    if (!vehicleNoPattern.test(vehicleNo)) {
      showPopup("Invalid Vehicle Number Format", true);
      return;
    }
  };

  const clearForm = () => {
    setFormData({
      operationType: "",
      transporterType: "",
      transporterName: "",
      vehicleNo: "",
      vesselName: "",
      containerNo: ""
    });
    setTransporters([]);
    setVehicles([]);
    setContainers([]);  
  };

  return (
    <>
      <video autoPlay muted loop id="bg-video">
        <source src="/videos/container-loading.mp4" type="video/mp4" />
      </video>

      <div className="overlay"></div>

      <div className="wrapper">
        <h1>VCTS</h1>

        {/* Operation Type */}
        <div className="form-group">
          <i className="fas fa-cogs"></i>
          <select
            name="operationType"
            value={formData.operationType}
            onChange={handleChange}
          >
            <option value="">Select Operation Type</option>
            <option value="Import">Import</option>
            <option value="Export">Export</option>
            <option value="Map">Map</option>
            <option value="View - Cancel">View - Cancel</option>
          </select>
        </div>

        {/* Transporter Type */}
        <div className="form-group">
          <i className="fas fa-truck"></i>
          <select
            name="transporterType"
            value={formData.transporterType}
            onChange={handleChange}
          >
            <option value="">Select Transporter Type</option>
            <option value="Own Transport">Own Transport</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Transporter Name */}
        <div className="form-group">
          <i className="fas fa-user"></i>
          {formData.transporterType === "Others" ? (
            <select
              name="transporterName"
              value={formData.transporterName}
              onChange={handleChange}
            >
              <option value="">Select Transporter</option>
              {transporters.map((item) => (
                <option key={item.TransId} value={item.TransId}>
                  {item.TransporterName}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="transporterName"
              value={formData.transporterName}
              readOnly
            />
          )}
        </div>

        {/* Vehicle No */}
        <div className="form-group">
          <i className="fas fa-car"></i>
          {formData.transporterType === "Others" ? (
            <select
              name="vehicleNo"
              value={formData.vehicleNo}
              onChange={handleChange}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v, index) => (
                <option key={index} value={v.VehicleNo}>
                  {v.VehicleNo}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="vehicleNo"
              placeholder="Enter Vehicle Number"
              value={formData.vehicleNo}
              onChange={handleChange}
            />
          )}
        </div>

        {/* Vessel Name */}
        <div className="form-group">
          <i className="fas fa-ship"></i>
          <select
            name="vesselName"
            value={formData.vesselName}
            onChange={handleChange}
          >
            <option value="">Select Vessel</option>
            {vessels.map((v, index) => (
              <option key={index} value={v.VesselId}>
                {v.VesselName}
              </option>
            ))}
          </select>
        </div>

        {/*Container Number Dropdown */}
        <div className="form-group">
          <i className="fas fa-box"></i>
          <select
            name="containerNo"
            value={formData.containerNo}
            onChange={handleChange}
          >
            <option value="">Select Container</option>
            {containers.map((c, index) => (
              <option key={index} value={c.ContainerNo}>
                {c.ContainerNo}
              </option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <button className="btn save" onClick={validateForm}>
            Save
          </button>
          <button className="btn clear" onClick={clearForm}>
            Clear
          </button>
        </div>
      </div>

      {popup.show && (
        <div className="popup">
          <div className={`popup-content ${popup.error ? "error" : ""}`}>
            <h2>{popup.message}</h2>
          </div>
        </div>
      )}
    </>
  );
}

export default App;