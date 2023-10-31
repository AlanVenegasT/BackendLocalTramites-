
class ResponseError {
    
    status = null;
    message = null;
    error = null;
    errors = null;
    
    constructor(status, message, error, errors){

        this.status = status;
        this.message = message;
        this.error = error;
        this.errors = errors;
    }

    responseApiError = () => {
        return {
            status: this.status , message: this.message, error: this.error, errors: this.errors
        }
    }

}

module.exports = ResponseError;
