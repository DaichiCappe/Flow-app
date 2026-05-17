import { useState } from "react";
export default function App() {
  return (
    <div style={{minHeight:"100vh",background:"#080b14",color:"#f9fafb",fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{fontSize:64}}>🌻</div>
      <div style={{fontSize:32,fontWeight:800,letterSpacing:"-0.03em"}}>Flow</div>
      <div style={{fontSize:14,color:"#6b7280"}}>Ton app est en ligne !</div>
    </div>
  );
}
