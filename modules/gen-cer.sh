#!/bin/bash
 
#Required
domain=$1
domaincsr=$domain"csr"
commonname=$domain
 
#Change to your company details
country=IN
state=Haryana
locality=Gurgaon
organization=Individual
organizationalunit=IT
email=nitesh.chaudhry@icloud.com
 
#Optional
password=dummypassword
 
if [ -z "$domain" ]
then
    echo "Argument not present."
    echo "Useage $0 [common name]"
 
    exit 99
fi
 
echo "Generating key request for $domain"

#-- change dir
cd /var/crypto

#Generate a key
# openssl genrsa -des3 -passout pass:$password -out $domain.key 2048 -noout
 
#Remove passphrase from the key. Comment the line out to keep the passphrase
# echo "Removing passphrase from key"
# openssl rsa -in $domain.key -passin pass:$password -out $domain.key
 
#Create the request
echo "Creating PEM"
# openssl req -new -key $domain.key -out $domain.csr -passin pass:$password \
    # -subj "/C=$country/ST=$state/L=$locality/O=$organization/OU=$organizationalunit/CN=$commonname/emailAddress=$email"
openssl req -newkey rsa:2048 -new -nodes -keyout $domain.pem -out $domaincsr.pem --passin pass:$password \
	-subj "/C=$country/ST=$state/L=$locality/O=$organization/OU=$organizationalunit/CN=$commonname/emailAddress=$email"

echo "Creating CRT"
openssl x509 -req -days 3650 -in $domaincsr.pem -signkey $domain.pem -out $domain.crt

echo "---------------------------"
echo "-----Below is your CRT-----"
echo "---------------------------"
echo
cat $domain.crt
 
echo
echo "---------------------------"
echo "-----Below is your Key-----"
echo "---------------------------"
echo
cat $domain.pem