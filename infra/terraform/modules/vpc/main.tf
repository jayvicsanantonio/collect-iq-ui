## Create VPC
resource "aws_vpc" "vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  tags = {
    Name = "${var.vpc_name}-${var.environment}"
  }
}

## Create IGW

resource "aws_internet_gateway" "igw" {
  count = var.create_igw ? 1 : 0
  vpc_id = aws_vpc.vpc.id
  tags = {
    Name        = "${var.vpc_name}-igw"
  }
}

## Create NATGW

resource "aws_eip" "nat_eip" {
  count = var.create_natgw ? 1 : 0
  vpc        = true
  depends_on = [aws_internet_gateway.igw]
}

resource "aws_nat_gateway" "natgw" {
  count 	= var.create_natgw ? 1 : 0
  allocation_id = aws_eip.nat_eip[0].id
  subnet_id     = element(aws_subnet.public_subnet.*.id, 0)
  depends_on    = [aws_internet_gateway.igw]
  tags = {
    Name        = "${var.vpc_name}-natgw"
  }
}

## Create Public Subnets

resource "aws_subnet" "public_subnet" {
  count                   = length(var.public_subnets_cidr)
  vpc_id 		  = aws_vpc.vpc.id
  cidr_block              = element(var.public_subnets_cidr, count.index)
  availability_zone       = element(var.availability_zones, count.index)
  map_public_ip_on_launch = true
  tags = {
    Name        	  = "${var.vpc_name}-public-subnet-az${count.index + 1}"
  }
}

## Create Private Subnets

resource "aws_subnet" "private_subnet" {
  count                   = length(var.private_subnets_cidr)
  vpc_id 		  = aws_vpc.vpc.id
  cidr_block              = element(var.private_subnets_cidr, count.index)
  availability_zone       = element(var.availability_zones, count.index)
  map_public_ip_on_launch = false
  tags = {
    Name        	  = "${var.vpc_name}-private-subnet-az${count.index + 1}"
  }
}

## Create Public Route Table, Routes, and Association

resource "aws_route_table" "public_rtb" {
  count = length(var.public_subnets_cidr)
  vpc_id = aws_vpc.vpc.id
  tags   = {
    Name = "${var.vpc_name}-public-subnet-rtb-az${count.index + 1}"
  }
}

resource "aws_route" "public_internet_gateway" {
  count 	         = length(var.public_subnets_cidr)
  route_table_id         = aws_route_table.public_rtb[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw[0].id
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnets_cidr)
  subnet_id      = aws_subnet.public_subnet[count.index].id
  route_table_id = aws_route_table.public_rtb[count.index].id
}

## Create Private Route Table, Routes, and Association

resource "aws_route_table" "private_rtb" {
  count = length(var.private_subnets_cidr)
  vpc_id = aws_vpc.vpc.id
  tags   = {
    Name = "${var.vpc_name}-private-subnet-rtb-az${count.index + 1}"
  }
}

resource "aws_route" "private_nat_gateway" {
  count 		 = length(var.private_subnets_cidr)
  route_table_id         = aws_route_table.private_rtb[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.natgw[0].id
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnets_cidr)
  subnet_id      = aws_subnet.private_subnet[count.index].id
  route_table_id = aws_route_table.private_rtb[count.index].id
}
