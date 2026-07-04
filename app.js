const gmeterSvg = document.querySelector("#g-meter svg");
const gmeterSegments = {};
const gmeterThreshold = [0.04, 0.2, 0.4];
const gmeterAccelerationText = document.getElementById("acceleration-text");
const NS = "http://www.w3.org/2000/svg";

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
      gmeterSvg.appendChild(segment);
      gmeterSegments[direction] ??= [];
      gmeterSegments[direction][i] = segment;
    }
  }
}

function getLevel(acceleration) {
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
  for (let i = 0; i < level; i++) {
    const segment = gmeterSegments[direction][i];
    segment.classList.add("active");
  }
}

function updateGMeter(accelX, accelY) {
  for (const direction in gmeterSegments) {
    for (let i = 0; i < gmeterSegments[direction].length; i++) {
      gmeterSegments[direction][i].classList.remove("active");
    }
  }

  const acceleration = Math.hypot(accelX, accelY);
  gmeterAccelerationText.textContent = `${acceleration.toFixed(2)} G`;

  const levelX = getLevel(Math.abs(accelX));
  const levelY = getLevel(Math.abs(accelY));
  const level = Math.min(levelX, levelY);

  if (accelX > 0) {
    activeSegments("E", levelX);
  } else if (accelX < 0) {
    activeSegments("W", levelX);
  }
  if (accelY > 0) {
    activeSegments("S", levelY);
  } else if (accelY < 0) {
    activeSegments("N", levelY);
  }
  if (accelX > 0 && accelY > 0) {
    activeSegments("SE", level);
  } else if (accelX > 0 && accelY < 0) {
    activeSegments("NE", level);
  } else if (accelX < 0 && accelY > 0) {
    activeSegments("SW", level);
  } else if (accelX < 0 && accelY < 0) {
    activeSegments("NW", level);
  }
}

createSegment();
updateGMeter(0.0, 0.0);