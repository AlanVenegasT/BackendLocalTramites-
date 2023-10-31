const nodemailer = require('nodemailer');
const ResponseError = require('../utils/ResponseError');

const emailRegistro = async (datos) =>{
    const { correo, nombre, token } = datos;

    try {

      const transport = nodemailer.createTransport({
        // host: "sandbox.smtp.mailtrap.io",
        // port: 2525,
        service: 'SendGrid',
        auth: {
          user: process.env.USERNAMESENDGRID,
          pass: process.env.APYKEYSENDGRID,
        }
      });

      const confirmarUrl = `https://generadordc3.com/confirmar/${token}`;

      //Información del email
      const info = await transport.sendMail({
        from: '"DBMIND" <antoniodjss2000@gmail.com>',
        to: correo,
        subject: "DBMIND - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en DBMIND",
        html: `<p>Hola: ${nombre} Comprueba tu cuenta en DBMIND</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:

        <a href="${confirmarUrl}">Comprobar cuenta</a>

        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        
        `,
      })
    } catch (ex) {
      const response = new ResponseError(
        'fail',
        'Error al enviar el correo del registro mediante Desarrollo',
        ex.message,
      []).responseApiError();

       // Devolver la respuesta de error utilizando tu clase ResponseError
       console.log(ex)
       return response.responseApiError();
    }
}


const emailOlvidePassword = async (datos) =>{
  const { correo, nombre, token } = datos;

  try {
  const transport = nodemailer.createTransport({
      // host: "sandbox.smtp.mailtrap.io",
      // port: 2525,
      service: 'SendGrid',
        auth: {
          user: process.env.USERNAMESENDGRID,
          pass: process.env.APYKEYSENDGRID,
        }
    });

    const olvideUrl = `https://generadordc3.com/login/olvide-password/${token}`;

    //Información del email
    const info = await transport.sendMail({
      from: '"DB-Mind" <antoniodjss2000@gmail.com>',
      to: correo,
      subject: "DB-Mind - Restablece tu password",
      text: "Restablece tu password",
      html: `<p>Hola: ${nombre} has solicitado reestablecer tu password</p>
      <p>Sigue el siguiente enlace para generar un password:

      <a href="${olvideUrl}">Reestablecer Password</a>

      <p>Si tu no solicitaste este email, puedes ignorar el mensaje</p>
      
      `,
    })
  } catch (ex) {
    const response = new ResponseError(
      'fail',
      'Error al enviar el correo de olvidePassword mediante Desarrollo',
      ex.message,
    []).responseApiError();

     // Devolver la respuesta de error utilizando tu clase ResponseError
     return response.responseApiError();
  }
}


module.exports ={ emailRegistro, emailOlvidePassword };