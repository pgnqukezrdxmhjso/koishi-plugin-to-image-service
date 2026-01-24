<div
  style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    fontSize: 24,
    fontWeight: 600,
    textAlign: "left",
    padding: 70,
    color: "red",
    backgroundImage: "linear-gradient(to right, #334d50, #cbcaa5)",
    height: "100%",
    width: "100%",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "#fff",
        }}
      >
        #fff
        <div style={{ fontWeight: 100 }}>hexadecimal</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "#ffffff70",
        }}
      >
        #ffffff70
        <div style={{ fontWeight: 100 }}>hexadecimal + transparency</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "rgb(45, 45, 45)",
        }}
      >
        rgb(45, 45, 45)
        <div style={{ fontWeight: 100 }}>rgb</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "rgb(45, 45, 45, 0.3)",
        }}
      >
        rgb(45, 45, 45, 0.3)
        <div style={{ fontWeight: 100 }}>rgba</div>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "hsl(186, 22%, 26%)",
        }}
      >
        hsl(186, 22%, 26%)
        <div style={{ fontWeight: 100 }}>hsl</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "hsla(186, 22%, 26%, 40%)",
        }}
      >
        hsla(186, 22%, 26%, 40%)
        <div style={{ fontWeight: 100 }}>hsla</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "white",
        }}
      >
        "white"
        <div style={{ fontWeight: 100 }}>predefined color names</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "15px",
          color: "currentcolor",
        }}
      >
        should be red
        <div style={{ fontWeight: 100 }}>"currentcolor"</div>
      </div>
    </div>
  </div>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      color: "white",
    }}
  >
    <div style={{ fontWeight: 900 }}>{new Date().toISOString()}</div>
    <div
      style={{
        display: "flex",
        gap: "25px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ fontWeight: 100 }}>fontWeight: 100</div>
        <div style={{ fontWeight: 200 }}>fontWeight: 200</div>
        <div style={{ fontWeight: 300 }}>fontWeight: 300</div>
        <div style={{ fontWeight: 400 }}>fontWeight: 400</div>
        <div style={{ fontWeight: 500 }}>fontWeight: 500</div>
        <div style={{ fontWeight: 600 }}>fontWeight: 600</div>
        <div style={{ fontWeight: 700 }}>fontWeight: 700</div>
        <div style={{ fontWeight: 800 }}>fontWeight: 800</div>
        <div style={{ fontWeight: 900 }}>fontWeight: 900</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontStyle: "italic",
        }}
      >
        <div style={{ fontWeight: 100 }}>fontWeight: 100</div>
        <div style={{ fontWeight: 200 }}>fontWeight: 200</div>
        <div style={{ fontWeight: 300 }}>fontWeight: 300</div>
        <div style={{ fontWeight: 400 }}>fontWeight: 400</div>
        <div style={{ fontWeight: 500 }}>fontWeight: 500</div>
        <div style={{ fontWeight: 600 }}>fontWeight: 600</div>
        <div style={{ fontWeight: 700 }}>fontWeight: 700</div>
        <div style={{ fontWeight: 800 }}>fontWeight: 800</div>
        <div style={{ fontWeight: 900 }}>fontWeight: 900</div>
      </div>
    </div>
  </div>
</div>;
