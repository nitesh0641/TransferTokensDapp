#!/bin/bash

#Required
domain=$1

if [ -z "$domain" ]
then
    echo "Argument not present."
    echo "Useage $0 [common name]"
 
    exit 99
fi

#-- change dir
cd /var/crypto

# Make keys
echo "Generating keys for $domain"
mkdir -p ./$domain
openssl genrsa -out ./$domain/privkey.pem 2048
openssl rsa -in ./$domain/privkey.pem -pubout -out ./$domain/pubkey.pem