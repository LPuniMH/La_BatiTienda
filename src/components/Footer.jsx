function Footer() {
  return (
    <footer className="footer">
      <div className="footer-contenido">
        <div className="footer-marca">
          <h2 className="footer-titulo">La BatiTienda</h2>
          <p className="footer-lema">Peluches con actitud, figuras con historia y mangas que no vas a soltar.</p>
        </div>

        <div className="footer-info">
          <p>📍 Viña del Mar, Chile</p>
          <p>🕐 Lunes a sábado, 11:00 a 20:00</p>
          <p>✉️ contacto@batitienda.cl</p>
        </div>
      </div>

      <hr className="footer-divisor" />

      <p className="footer-copy">&copy; 2026 La BatiTienda. Todos los derechos reservados.</p>
    </footer>
  );
}

export default Footer;