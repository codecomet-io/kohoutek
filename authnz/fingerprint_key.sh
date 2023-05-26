openssl rsa -in *.private-key.pem -pubout -outform DER | openssl sha256 -binary | openssl base64
