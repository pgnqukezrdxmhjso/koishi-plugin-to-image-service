a = () => (
  <div
    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
  >
    <img
      width={50}
      height={50}
      src="https://dummyimage.com/50x50/6e2d6e/c2c5ed.png"
      alt=""
    />
    <img
      width={99}
      height={99}
      src="https://dummyimage.com/99x99/6e2d6e/c2c5ed.png"
      alt=""
    />
    <img
      width={99}
      height={99}
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABjBAMAAAB9FaOmAAAAHlBMVEVuLW7Cxe2DU42Yea2NZp14QH2tn82ijL23st2KYZn18zyzAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAvElEQVRYhe3QMQqDQBAF0I+62WsE9ACSNdgKNimXWKRNl1YMHiEniAfOzEYSA7Kphf9g8f9CdmYBIiIioq1L3B754VM1LuqqylRp0zVz07ioq0yJXQdc56pxUdfnapBOwFH/tUAhUc+fW+wTGGQDjOGWoQs1YsTp4rMHkNUesBJtqBGpa72rdJKbVo3vGiMroJfPuQy1n09MER5BJsy1adQT0dZl5u7yDh6JLCQx1ChZ2nybwU8lIiIi2rAXk9AZ89dbMloAAAAASUVORK5CYII="
      alt=""
    />
    <div tw="flex justify-center items-center text-3xl">{Date.now()}</div>
  </div>
);
