openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./selfsigned.key -out selfsigned.crt -subj /C=uk/ST=''/L=''/O=''/OU=''/CN=localhost

mv selfsigned.key  ./src/selfsigned.key 
mv selfsigned.crt  ./src/selfsigned.crt
