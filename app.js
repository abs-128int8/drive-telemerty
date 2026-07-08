const NS = "http://www.w3.org/2000/svg";

const uiElements = {
  gmeter: {
    svg: document.getElementById("g-meter-svg"),
    accelValue: document.getElementById("acceleration-value")
  },
  speedMeter: {
    speedValue: document.getElementById("speed-value"),
    stopTime: document.getElementById("stop-time"),
    stopTimeValue: document.getElementById("stop-time-value"),
    distanceValue: document.getElementById("distance-value"),
    deltaTimeValue: document.getElementById("delta-time-value")
  },
  sectorStats: {
    number: document.getElementById("sector-number"),
    startTime: document.getElementById("sector-start"),
    distanceValue: document.getElementById("sector-distance-value"),
    deltaTimeValue: document.getElementById("sector-delta-time-value"),
    maxSpeedValue: document.getElementById("sector-max-speed-value"),
    avgSpeedValue: document.getElementById("sector-avg-speed-value"),
    maxAccelValue: document.getElementById("sector-max-acceleration-value"),
    accel020Value: document.getElementById("sector-0-20-value")
  },
  history: document.getElementById("history-body"),
}

const gmeterSegments = {};
const gmeterThreshold = [0.04, 0.2, 0.4];
const uiState = {
  gmeterActiveSegments: {},
  stopTimeActive: false,
  selectedHistoryEntry: null
}
const telemetry = {
  gmeter: {
    accel: {
      x: 0,
      y: 0,
      get magnitude() {
        return Math.hypot(this.x, this.y);
      }
    },
  },
  speedMeter: {
    speed: 0,
    stopTimeStart: null,
    stopTimeActive: false,
    distanceAccumulated: 0,
    deltaTimeAccumulated: 0,
    lastTimestamp: null,
    lastPosition: null
  },
  currentSector: {
    active: false,
    stats: {
      number: 0,
      startTime: null,
      distance: 0,
      time: null,
      maxSpeed: 0,
      avgSpeed: 0,
      maxAccel: 0,
      accel020: 0
    },
    speedSum: 0,
    speedSamples: 0,
    get averageSpeed() {
      return this.speedSamples > 0 ? this.speedSum / this.speedSamples : 0;
    }
  },
  historyEntries: [],
  dirty: {
    gmeter: true,
    speedMeter: true,
    sectorStats: true
  }
};


function radian(degree) {
  return (degree * Math.PI) / 180;
}

function degree(radian) {
  return (radian * 180) / Math.PI;
}

function createSegment() {
  const rings = [
    { w: 200, h: 80 },
    { w: 300, h: 120 },
    { w: 400, h: 160 },
    { w: 500, h: 200 }
  ];

  const segmentAngles = {
    N: [230, 310],
    NE: [310, 350],
    E: [350, 10],
    SE: [10, 50],
    S: [50, 130],
    SW: [130, 170],
    W: [170, 190],
    NW: [190, 230]
  };

  const segmentColors = ["skyblue", "white", "crimson"];
  const strokeWidth = 4;
  const roundRadius = 20;

  for (let i = 0; i < 3; i++) {
    for (let direction in segmentAngles) {
      const segment = document.createElementNS(NS, "path");
      let d;
      switch (direction) {
        case "N": {
          const y1 = -rings[i].h / 2 - strokeWidth / 2;
          const y2 = -rings[i + 1].h / 2 + strokeWidth / 2;
          const x11 = y1 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth / 2;
          const x12 = y1 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth / 2;
          const x21 = y2 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth / 2;
          const x22 = y2 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth / 2;
          d = `M ${x11} ${y1} L ${x12} ${y1} L ${x22} ${y2} L ${x21} ${y2} Z`;
          break;
        }
        case "S": {
          const y1 = rings[i].h / 2 + strokeWidth / 2;
          const y2 = rings[i + 1].h / 2 - strokeWidth / 2;
          const x11 = y1 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth / 2;
          const x12 = y1 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth / 2;
          const x21 = y2 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth / 2;
          const x22 = y2 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth / 2;
          d = `M ${x11} ${y1} L ${x12} ${y1} L ${x22} ${y2} L ${x21} ${y2} Z`;
          break;
        }
        case "E": {
          const x1 = rings[i].w / 2 + strokeWidth / 2;
          const x2 = rings[i + 1].w / 2 - strokeWidth / 2;
          const y11 = x1 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth / 2;
          const y12 = x1 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth / 2;
          const y21 = x2 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth / 2;
          const y22 = x2 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth / 2;
          d = `M ${x1} ${y11} L ${x1} ${y12} L ${x2} ${y22} L ${x2} ${y21} Z`;
          break;
        }
        case "W": {
          const x1 = -rings[i].w / 2 - strokeWidth / 2;
          const x2 = -rings[i + 1].w / 2 + strokeWidth / 2;
          const y11 = x1 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth / 2;
          const y12 = x1 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth / 2;
          const y21 = x2 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth / 2;
          const y22 = x2 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth / 2;
          d = `M ${x1} ${y11} L ${x1} ${y12} L ${x2} ${y22} L ${x2} ${y21} Z`;
          break;
        }
        case "NE": {
          const y11 = -rings[i].h / 2 - strokeWidth / 2;
          const x11 = y11 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth;
          const x12 = rings[i].w / 2 - roundRadius;
          const y12 = y11;

          const y21 = -rings[i + 1].h / 2 + strokeWidth / 2;
          const x21 = y21 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth;
          const x22 = rings[i + 1].w / 2 - roundRadius;
          const y22 = y21;

          const x13 = rings[i].w / 2 + strokeWidth / 2;
          const y13 = -rings[i].h / 2 + roundRadius;
          const x14 = x13;
          const y14 = x14 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth / 2;

          const x23 = rings[i + 1].w / 2 - strokeWidth / 2;
          const y23 = -rings[i + 1].h / 2 + roundRadius;
          const x24 = x23;
          const y24 = x24 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth / 2;

          const arc1 = `A ${roundRadius + strokeWidth} ${roundRadius + strokeWidth} 0 0 1 ${x13} ${y13}`;
          const arc2 = `A ${roundRadius - strokeWidth / 2} ${roundRadius - strokeWidth / 2} 0 0 0 ${x22} ${y22}`;
          d = `M ${x11} ${y11} L ${x12} ${y12} ${arc1} L ${x14} ${y14}`
            + `L ${x24} ${y24} L ${x23} ${y23} ${arc2} L ${x21} ${y21} Z`;
          break;
        }
        case "SE": {
          const x11 = rings[i].w / 2 + strokeWidth / 2;
          const y11 = x11 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth / 2;
          const x12 = x11;
          const y12 = rings[i].h / 2 - roundRadius;

          const x21 = rings[i + 1].w / 2 - strokeWidth / 2;
          const y21 = x21 * Math.tan(radian(segmentAngles[direction][0])) + strokeWidth / 2;
          const x22 = x21;
          const y22 = rings[i + 1].h / 2 - roundRadius;

          const x13 = rings[i].w / 2 - roundRadius;
          const y13 = rings[i].h / 2 + strokeWidth / 2;
          const y14 = y13;
          const x14 = y14 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth;

          const x23 = rings[i + 1].w / 2 - roundRadius;
          const y23 = rings[i + 1].h / 2 - strokeWidth / 2;
          const y24 = y23;
          const x24 = y24 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth;

          const arc1 = `A ${roundRadius + strokeWidth} ${roundRadius + strokeWidth} 0 0 1 ${x13} ${y13}`;
          const arc2 = `A ${roundRadius - strokeWidth / 2} ${roundRadius - strokeWidth / 2} 0 0 0 ${x22} ${y22}`;
          d = `M ${x11} ${y11} L ${x12} ${y12} ${arc1} L ${x14} ${y14}`
            + `L ${x24} ${y24} L ${x23} ${y23} ${arc2} L ${x21} ${y21} Z`;
          break;
        }
        case "SW": {
          const y11 = rings[i].h / 2 + strokeWidth / 2;
          const x11 = y11 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth;
          const x12 = -rings[i].w / 2 + roundRadius;
          const y12 = y11;

          const y21 = rings[i + 1].h / 2 - strokeWidth / 2;
          const x21 = y21 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth;
          const x22 = -rings[i + 1].w / 2 + roundRadius;
          const y22 = y21;

          const x13 = -rings[i].w / 2 - strokeWidth / 2;
          const y13 = rings[i].h / 2 - roundRadius;
          const x14 = x13;
          const y14 = x14 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth / 2;

          const x23 = -rings[i + 1].w / 2 + strokeWidth / 2;
          const y23 = rings[i + 1].h / 2 - roundRadius;
          const x24 = x23;
          const y24 = x24 * Math.tan(radian(segmentAngles[direction][1])) + strokeWidth / 2;

          const arc1 = `A ${roundRadius + strokeWidth} ${roundRadius + strokeWidth} 0 0 1 ${x13} ${y13}`;
          const arc2 = `A ${roundRadius - strokeWidth / 2} ${roundRadius - strokeWidth / 2} 0 0 0 ${x22} ${y22}`;
          d = `M ${x11} ${y11} L ${x12} ${y12} ${arc1} L ${x14} ${y14}`
            + `L ${x24} ${y24} L ${x23} ${y23} ${arc2} L ${x21} ${y21} Z`;
          break;
        }
        case "NW": {
          const x11 = -rings[i].w / 2 - strokeWidth / 2;
          const y11 = x11 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth / 2;
          const x12 = x11;
          const y12 = -rings[i].h / 2 + roundRadius;

          const x21 = -rings[i + 1].w / 2 + strokeWidth / 2;
          const y21 = x21 * Math.tan(radian(segmentAngles[direction][0])) - strokeWidth / 2;
          const x22 = x21;
          const y22 = -rings[i + 1].h / 2 + roundRadius;

          const x13 = -rings[i].w / 2 + roundRadius;
          const y13 = -rings[i].h / 2 - strokeWidth / 2;
          const y14 = y13;
          const x14 = y14 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth;

          const x23 = -rings[i + 1].w / 2 + roundRadius;
          const y23 = -rings[i + 1].h / 2 + strokeWidth / 2;
          const y24 = y23;
          const x24 = y24 * Math.tan(radian(segmentAngles[direction][1])) - strokeWidth;

          const arc1 = `A ${roundRadius + strokeWidth} ${roundRadius + strokeWidth} 0 0 1 ${x13} ${y13}`;
          const arc2 = `A ${roundRadius - strokeWidth / 2} ${roundRadius - strokeWidth / 2} 0 0 0 ${x22} ${y22}`;
          d = `M ${x11} ${y11} L ${x12} ${y12} ${arc1} L ${x14} ${y14}`
            + `L ${x24} ${y24} L ${x23} ${y23} ${arc2} L ${x21} ${y21} Z`;
          break;
        }
        default:
          console.error(`Unknown direction: ${direction}`);
          break;
      }
      segment.setAttribute("d", d);
      segment.setAttribute("fill", segmentColors[i]);
      segment.classList.add("gmeter-segment");
      uiElements.gmeter.svg.appendChild(segment);
      gmeterSegments[direction] ??= [];
      gmeterSegments[direction][i] = segment;
    }
  }
}

function getActiveSegmentCount(acceleration) {
  let level = 0;
  for (let i = 0; i < gmeterThreshold.length; i++) {
    if (acceleration > gmeterThreshold[i]) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

function activeSegments(direction, level) {
  uiState.gmeterActiveSegments[direction] = level;
  for (let i = 0; i < level; i++) {
    const segment = gmeterSegments[direction][i];
    segment.classList.add("active");
  }
}

function updateGMeter(gmeter) {
  for (const direction in uiState.gmeterActiveSegments) {
    const previousLevel = uiState.gmeterActiveSegments[direction];
    for (let i = 0; i < previousLevel; i++) {
      gmeterSegments[direction][i].classList.remove("active");
    }
    delete uiState.gmeterActiveSegments[direction];
  }

  uiElements.gmeter.accelValue.textContent = gmeter.accel.magnitude.toFixed(2);

  const levelX = getActiveSegmentCount(Math.abs(gmeter.accel.x));
  const levelY = getActiveSegmentCount(Math.abs(gmeter.accel.y));
  const level = Math.min(levelX, levelY);

  if (gmeter.accel.x > 0) {
    activeSegments("E", levelX);
  } else if (gmeter.accel.x < 0) {
    activeSegments("W", levelX);
  }
  if (gmeter.accel.y > 0) {
    activeSegments("S", levelY);
  } else if (gmeter.accel.y < 0) {
    activeSegments("N", levelY);
  }
  if (gmeter.accel.x > 0 && gmeter.accel.y > 0) {
    activeSegments("SE", level);
  } else if (gmeter.accel.x > 0 && gmeter.accel.y < 0) {
    activeSegments("NE", level);
  } else if (gmeter.accel.x < 0 && gmeter.accel.y > 0) {
    activeSegments("SW", level);
  } else if (gmeter.accel.x < 0 && gmeter.accel.y < 0) {
    activeSegments("NW", level);
  }
}

function secToTime(seconds) {
  return String(Math.floor(seconds / 3600)).padStart(2, "0")
    + ":"
    + String(Math.floor(seconds % 3600 / 60)).padStart(2, "0")
    + ":"
    + String(Math.floor(seconds % 60)).padStart(2, "0");
}

function dateToTime(date) {
  return String(date.getHours()).padStart(2, "0")
    + ":"
    + String(date.getMinutes()).padStart(2, "0")
    + ":"
    + String(date.getSeconds()).padStart(2, "0");
}

function updateSpeedMeter(speedMeter) {
  uiElements.speedMeter.speedValue.textContent = speedMeter.speed !== null ? speedMeter.speed.toFixed(2) : "-";
  uiElements.speedMeter.distanceValue.textContent = speedMeter.distanceAccumulated.toFixed(2);
  uiElements.speedMeter.deltaTimeValue.textContent = secToTime(speedMeter.deltaTimeAccumulated);
  if (uiState.stopTimeActive !== speedMeter.stopTimeActive) {
    uiState.stopTimeActive = speedMeter.stopTimeActive;
    uiElements.speedMeter.stopTime.classList.toggle("active", speedMeter.stopTimeActive);
  }
  if (uiState.stopTimeActive) {
    uiElements.speedMeter.stopTimeValue.textContent = Math.round((Date.now() - speedMeter.stopTimeStart) / 1000);
  }
}

function updateSectorStats(stats) {
  uiElements.sectorStats.number.textContent = stats.number;
  uiElements.sectorStats.startTime.textContent = dateToTime(new Date(stats.startTime));
  uiElements.sectorStats.distanceValue.textContent = stats.distance.toFixed(2);
  uiElements.sectorStats.deltaTimeValue.textContent = secToTime(stats.time);
  uiElements.sectorStats.maxSpeedValue.textContent = stats.maxSpeed.toFixed(2);
  uiElements.sectorStats.avgSpeedValue.textContent = stats.avgSpeed.toFixed(2);
  uiElements.sectorStats.maxAccelValue.textContent = stats.maxAccel.toFixed(2);
  uiElements.sectorStats.accel020Value.textContent = stats.accel020.toFixed(2);
}

function addHistoryEntry(entry) {
  const row = document.createElement("tr");
  row.dataset.number = entry.number;
  const numberCell = document.createElement("td");
  numberCell.textContent = entry.number;
  const distanceCell = document.createElement("td");
  distanceCell.textContent = entry.distance.toFixed(2) + " km";
  const timeCell = document.createElement("td");
  timeCell.textContent = dateToTime(new Date(entry.startTime));
  row.appendChild(numberCell);
  row.appendChild(distanceCell);
  row.appendChild(timeCell);
  uiElements.history.appendChild(row);
}

function startNextSector() {
  telemetry.currentSector.active = true;

  telemetry.currentSector.stats.number++;
  telemetry.currentSector.stats.startTime = Date.now();

  telemetry.currentSector.stats.distance = 0;
  telemetry.currentSector.stats.time = 0;
  telemetry.currentSector.stats.maxSpeed = 0;
  telemetry.currentSector.stats.avgSpeed = 0;
  telemetry.currentSector.stats.maxAccel = 0;
  telemetry.currentSector.stats.accel020 = 0;

  telemetry.currentSector.speedSum = 0;
  telemetry.currentSector.speedSamples = 0;
}

function finishCurrentSector() {
  if (!telemetry.currentSector.active) {
    return;
  }
  telemetry.currentSector.active = false;
  const entry = structuredClone(telemetry.currentSector.stats);
  telemetry.historyEntries.push(entry);
  addHistoryEntry(entry);
}

function updateCurrentSector(speed, deltaTime) {
  telemetry.currentSector.stats.distance += speed * deltaTime / 3600;
  telemetry.currentSector.stats.time += deltaTime;
  telemetry.currentSector.stats.maxSpeed = Math.max(telemetry.currentSector.stats.maxSpeed, speed);
  telemetry.currentSector.speedSum += speed;
  telemetry.currentSector.speedSamples++;
  telemetry.currentSector.stats.avgSpeed = telemetry.currentSector.averageSpeed;
  telemetry.dirty.sectorStats = true;
}

function onGPS(position) {
  const deltaTime = (position.timestamp - (telemetry.speedMeter.lastTimestamp ?? position.timestamp)) / 1000;
  const speed = position.coords.speed !== null ? position.coords.speed * 3.6 : null;
  telemetry.speedMeter.lastTimestamp = position.timestamp;
  if (speed !== null) {
    if (speed <= 5) {
      if (!telemetry.speedMeter.stopTimeActive) {
        telemetry.speedMeter.stopTimeActive = true;
        telemetry.speedMeter.stopTimeStart = Date.now();
        finishCurrentSector();
      }
      telemetry.speedMeter.speed = 0;
      telemetry.speedMeter.deltaTimeAccumulated += deltaTime;
    } else {
      if (telemetry.speedMeter.stopTimeActive) {
        telemetry.speedMeter.stopTimeActive = false;
        telemetry.speedMeter.stopTimeStart = null;
        startNextSector();
      }
      telemetry.speedMeter.speed = speed;
      telemetry.speedMeter.deltaTimeAccumulated += deltaTime;
      telemetry.speedMeter.distanceAccumulated += speed * deltaTime / 3600;
      updateCurrentSector(speed, deltaTime);
    }
  } else {
    telemetry.speedMeter.speed = null;
  }
  telemetry.dirty.speedMeter = true;
}

function onErrorGPS(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("GPSを許可してください");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("GPSの位置情報が取得できません");
      break;
    case error.TIMEOUT:
      alert("GPSの取得がタイムアウトしました");
      break;
    default:
      alert(error.message);
      break;
  }
}

function onDeviceMotion(event) {
}

function onHistoryEntryClick(event) {
  const row = event.target.closest("tr");
  if (!row) {
    return;
  }

  if (uiState.selectedHistoryEntry === row) {
    row.classList.remove("selected");
    uiState.selectedHistoryEntry = null;
    updateSectorStats(telemetry.currentSector.stats);
  } else {
    if (uiState.selectedHistoryEntry) {
      uiState.selectedHistoryEntry.classList.remove("selected");
    }

    row.classList.add("selected");
    uiState.selectedHistoryEntry = row;
  }
  telemetry.dirty.sectorStats = true;
}

function render() {
  if (telemetry.dirty.gmeter) {
    updateGMeter(telemetry.gmeter);
    telemetry.dirty.gmeter = false;
  }

  if (telemetry.dirty.speedMeter || telemetry.speedMeter.stopTimeActive) {
    updateSpeedMeter(telemetry.speedMeter);
    if (!telemetry.speedMeter.stopTimeActive) {
      telemetry.dirty.speedMeter = false;
    }
  }

  if (telemetry.dirty.sectorStats) {
    if (!uiState.selectedHistoryEntry) {
      updateSectorStats(telemetry.currentSector.stats);
    } else {
      const number = Number(uiState.selectedHistoryEntry.dataset.number);
      const entry = telemetry.historyEntries.find(e => e.number === number);
      if (entry) {
        updateSectorStats(entry);
      }
    }
    telemetry.dirty.sectorStats = false;
  }

  requestAnimationFrame(render);
}

function main() {
  if (navigator.geolocation) {
    const options = {
      "enableHighAccuracy": true,
      "timeout": 10000,
      "maximumAge": 0,
    };
    navigator.geolocation.watchPosition(onGPS, onErrorGPS, options);
  } else {
    alert("ブラウザがGPSに対応していません");
  }

  uiElements.history.addEventListener("click", onHistoryEntryClick);

  createSegment();
  render();
}

main();