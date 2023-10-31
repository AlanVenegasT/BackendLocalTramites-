const sgMail = require('@sendgrid/mail');
const ResponseError = require('../utils/ResponseError');

sgMail.setApiKey(process.env.APYKEYSENDGRID);

const emailRegistroP = async (datos, res, req) => {
  const { correo, nombre, token } = datos;

  const confirmarUrl = `https://generadordc3.com/confirmar/${token}`;

  const msg = {
    to: correo,
    from: 'alan4444v@gmail.com',
    subject: 'IKTAN - Comprueba tu cuenta',
    text: 'Comprueba tu cuenta en IKTAN',
    html: `<p>Hola: ${nombre} Comprueba tu cuenta en IKTAN</p>
      <p>Tu cuenta ya está casi lista, solo debes comprobarla en el siguiente enlace:</p>
      <a href="${confirmarUrl}">Comprobar cuenta</a>
      <p>Si tú no creaste esta cuenta, puedes ignorar el mensaje</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Correo de confirmación enviado con éxito');
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al enviar el mensaje de registro mediante SendGrid',
      ex.message,
      []).responseApiError();
    
      return response.responseApiError();
  } // Aquí faltaba la llave de cierre '}' para el bloque try
};

const emailOlvidePasswordP = async (datos, res) => {
  const { correo, nombre, token } = datos;

  const olvideUrl = `https://generadordc3.com/olvide-password/${token}`;

  const msg = {
    to: correo,
    from: 'iktanstrategies@iktanst.com',
    subject: 'IKTAN - Restablece tu contraseña',
    text: 'Restablece tu contraseña',
    html: `<p>Hola: ${nombre}, has solicitado restablecer tu contraseña</p>
      <p>Sigue el siguiente enlace para generar una nueva contraseña:</p>
      <a href="${olvideUrl}">Restablecer Contraseña</a>
      <p>Si tú no solicitaste este correo, puedes ignorar el mensaje</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Correo de restablecimiento de contraseña enviado con éxito');
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al enviar el mensaje de OlvideContraseña mediante SendGrid',
      ex.message,
      []).responseApiError();
    
      return response.responseApiError();
  }
};

module.exports = { emailRegistroP, emailOlvidePasswordP };