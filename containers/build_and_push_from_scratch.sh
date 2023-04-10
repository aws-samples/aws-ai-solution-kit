#!/usr/bin/env bash

# This script shows how to build the Docker image and push it to ECR to be ready for use
# by Braket.

# The argument to this script is the image name. This will be used as the image on the local
# machine and combined with the account and region to form the repository name for ECR.
dockerfile=$1
image=$2

if [ "$image" = "" ] || [ "$dockerfile" = "" ]
then
    echo "Usage: $0 <docker-file> <image-name>"
    exit 1
fi

# Get the account number associated with the current IAM credentials
account=$(aws sts get-caller-identity --query Account --output text)

if [ $? -ne 0 ]
then
    exit 255
fi


# Get the region defined in the current configuration (default to us-west-2 if none defined)
region=$(aws configure get region)
# region=${region:-us-west-2}


fullname="${account}.dkr.ecr.${region}.amazonaws.com/${image}:latest"

# If the repository doesn't exist in ECR, create it.

desc_output=$(aws ecr describe-repositories --repository-names ${image} 2>&1)

if [ $? -ne 0 ]
then
    if echo ${desc_output} | grep -q RepositoryNotFoundException
    then
        aws ecr create-repository --repository-name "${image}" > /dev/null
    else
        >&2 echo ${desc_output}
    fi
fi

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 763104351884.dkr.er.us-east-1.amazonaws.com
aws ecr get-login-password --region us-west-2 | docker login -u AWS --password-stdin 292282985366.dkr.ecr.us-west-2.amazonaws.com
aws ecr get-login-password --region ${region} | docker login -u AWS --password-stdin ${account}.dkr.ecr.${region}.amazonaws.com

cp ${dockerfile} .
cp extensions/sd-webui-sagemaker/.dockerignore .

# Build the docker image locally with the image name and then push it to ECR
# with the full name.

docker build  -t ${image} -f ${dockerfile} .
docker tag ${image} ${fullname}

docker push ${fullname}
echo $fullname

# rm webui.tar.gz