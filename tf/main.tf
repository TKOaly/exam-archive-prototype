terraform {
  backend "s3" {
    region = "eu-west-1"
    bucket = "exam-archive-state"
    key    = "exam-archive-state"
  }
}

locals {
  aws_region      = "eu-west-1"
  container_port  = 9001
  host_domain     = "tarpisto-beta.tko-aly.fi"
  cdn_domain      = "tarpisto.cdn.tko-aly.fi"
}

provider "aws" {
  profile = "default"
  region  = local.aws_region
}

provider "aws" {
  // need us-east-1 provider to access CloudFront ACM cert
  profile = "default"
  alias = "virginia"
  region = "us-east-1"
}

data "aws_ssm_parameter" "exam_archive_cookie_secret" {
  name = "exam-archive-cookie-secret"
}

data "aws_ssm_parameter" "exam_archive_pg_connection_string" {
  name = "exam-archive-pg-connection-string"
}

data "aws_ssm_parameter" "exam_archive_user_service_id" {
  name = "exam-archive-user-service-id"
}

data "aws_ssm_parameter" "exam_archive_user_service_url" {
  name = "exam-archive-user-service-url"
}

data "aws_ssm_parameter" "exam_archive_cf_signing_key_id" {
  name = "exam-archive-cf-signing-key-id"
}

data "aws_ssm_parameter" "exam_archive_cf_signing_key" {
  name = "exam-archive-cf-signing-key"
}

locals {
  ssm_param_prefix = "${split("/", data.aws_ssm_parameter.exam_archive_cookie_secret.arn)[0]}/exam-archive-*"
}

data "aws_acm_certificate" "cdn_certificate" {
  domain = "*.cdn.tko-aly.fi"
  // needs to be us-east so it works with cloudfront
  provider = aws.virginia
}

data "aws_vpc" "my_vpc" {
  filter {
    name    = "tag:Name"
    values  = ["tekis-VPC"]
  }
}

data "aws_subnet_ids" "exam_archive_subnets" {
  vpc_id = data.aws_vpc.my_vpc.id
  filter {
    name    = "tag:Name"
    values  = [
      "tekis-private-subnet-1a",
      "tekis-private-subnet-1b"
    ]
  }
}

data "aws_ecr_repository" "exam_archive_repository" {
  name = "tkoaly/exam-archive"
}

data "aws_ecs_cluster" "cluster" {
  cluster_name = "christina-regina"
}

data "aws_lb" "my_lb" {
  name = "tekis-loadbalancer-1"
}

data "aws_lb_listener" "alb_listener" {
  load_balancer_arn = data.aws_lb.my_lb.arn
  port              = 443
}

resource "aws_s3_bucket" "exam_archive_files_s3_bucket" {
  bucket  = "exam-archive-files"
  acl     = "private"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "exam_archive_files_s3_block" {
  bucket                  = aws_s3_bucket.exam_archive_files_s3_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}

data "aws_iam_policy_document" "exam_archive_files_s3_policy_doc" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.exam_archive_files_s3_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.exam_archive_files_cf_oai.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "exam_archive_files_s3_policy" {
  bucket = aws_s3_bucket.exam_archive_files_s3_bucket.id
  policy = data.aws_iam_policy_document.exam_archive_files_s3_policy_doc.json
}

locals {
  s3_origin_id = "S3-${aws_s3_bucket.exam_archive_files_s3_bucket.id}"
}

resource "aws_cloudfront_origin_access_identity" "exam_archive_files_cf_oai" {
  comment = "access-identity-exam-archive-files"
}

resource "aws_cloudfront_distribution" "exam_archive_cf_files_distribution" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"
  aliases         = [local.cdn_domain]

  default_cache_behavior {
    target_origin_id        = local.s3_origin_id
    viewer_protocol_policy  = "redirect-to-https"
    allowed_methods         = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
    compress                = true
    min_ttl                 = 0
    max_ttl                 = 3600
    default_ttl             = 3600

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    trusted_signers = ["self"]
  }

  origin {
    domain_name = aws_s3_bucket.exam_archive_files_s3_bucket.bucket_regional_domain_name
    origin_id = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.exam_archive_files_cf_oai.cloudfront_access_identity_path
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.cdn_certificate.arn
    minimum_protocol_version = "TLSv1"
    ssl_support_method = "sni-only"
  }
}

resource "aws_iam_role" "exam_archive_task_role" {
  name                = "exam-archive-task-role"
  assume_role_policy  = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "exam_archive_task_role_policy" {
  name    = "exam-archive-task-role-policy"
  role    = aws_iam_role.exam_archive_task_role.id
  policy  = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl",
        "s3:UploadPart",
        "s3:UploadPartCopy",
        "s3:ListBucket"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.exam_archive_files_s3_bucket.arn}/*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role" "exam_archive_execution_role" {
  name                = "exam-archive-execution-role"
  assume_role_policy  = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "exam_archive_execution_role_policy" {
  name    = "exam-archive-execution-role-policy"
  role    = aws_iam_role.exam_archive_execution_role.id
  policy  = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ssm:GetParameters"
      ],
      "Effect": "Allow",
      "Resource": ["${local.ssm_param_prefix}"]
    }
  ]
}
EOF
}

data "aws_iam_policy" "AmazonECSTaskExecutionRolePolicy" {
  arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "exam_archive_execution_role_policy_ecs_attachment" {
  policy_arn  = data.aws_iam_policy.AmazonECSTaskExecutionRolePolicy.arn
  role        = aws_iam_role.exam_archive_execution_role.id
}

resource "aws_security_group" "exam_archive_task_sg" {
  name    = "exam-archive-task-sg"
  vpc_id  = data.aws_vpc.my_vpc.id

  ingress {
    from_port   = local.container_port
    to_port     = local.container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb_target_group" "exam_archive_lb_target_group" {
  name        = "exam-archive-target-group"
  port        = local.container_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.my_vpc.id
  target_type = "ip"

  health_check {
    path = "/healthcheck"
    matcher = 200
  }

  stickiness {
    enabled = false
    type = "lb_cookie"
  }
}

resource "aws_lb_listener_rule" "exam_archive_lb_listener_rule" {
  listener_arn = data.aws_lb_listener.alb_listener.arn

  action {
    type = "forward"
    target_group_arn = aws_lb_target_group.exam_archive_lb_target_group.arn
  }

  condition {
    host_header {
      values = [local.host_domain]
    }
  }
}

resource "aws_cloudwatch_log_group" "exam_archive_cw" {
  name = "/ecs/default/exam-archive"
}

resource "aws_ecs_task_definition" "exam_archive_task" {
  family                    = "exam-archive-service"
  network_mode              = "awsvpc"
  requires_compatibilities  = ["FARGATE"]
  cpu                       = 256
  memory                    = 512
  task_role_arn             = aws_iam_role.exam_archive_task_role.arn
  execution_role_arn        = aws_iam_role.exam_archive_execution_role.arn
  container_definitions     = <<DEFINITION
[
  {
    "name": "exam_archive_task",
    "image": "${data.aws_ecr_repository.exam_archive_repository.repository_url}:latest",
    "cpu": 256,
    "memory": null,
    "memoryReservation": null,
    "essential": true,
    "portMappings": [{
      "containerPort": ${local.container_port},
      "hostPort": ${local.container_port},
      "protocol": "tcp"
    }],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "${aws_cloudwatch_log_group.exam_archive_cw.name}",
        "awslogs-region": "${local.aws_region}",
        "awslogs-stream-prefix": "ecs",
        "awslogs-datetime-format": "%Y-%m-%d %H:%M:%S"
      }
    },
    "environment": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "PORT", "value": "${local.container_port}" },
      { "name": "AWS_REGION", "value": "${local.aws_region}" },
      { "name": "AWS_S3_BUCKET_ID", "value": "${aws_s3_bucket.exam_archive_files_s3_bucket.id}" },
      { "name": "AWS_CF_DISTRIBUTION_DOMAIN", "value": "${local.cdn_domain}" }
    ],
    "secrets": [
      { "name": "PG_CONNECTION_STRING", "valueFrom": "${data.aws_ssm_parameter.exam_archive_pg_connection_string.arn}" },
      { "name": "COOKIE_SECRET", "valueFrom": "${data.aws_ssm_parameter.exam_archive_cookie_secret.arn}" },
      { "name": "USER_SERVICE_SERVICE_ID", "valueFrom": "${data.aws_ssm_parameter.exam_archive_user_service_id.arn}" },
      { "name": "USER_SERVICE_URL", "valueFrom": "${data.aws_ssm_parameter.exam_archive_user_service_url.arn}" },
      { "name": "AWS_CF_KEY_ID", "valueFrom": "${data.aws_ssm_parameter.exam_archive_cf_signing_key_id.arn}" },
      { "name": "AWS_CF_KEY", "valueFrom": "${data.aws_ssm_parameter.exam_archive_cf_signing_key.arn}" }
    ]
  }
]
DEFINITION
}

resource "aws_ecs_service" "exam_archive_service" {
  name            = "exam-archive"
  cluster         = data.aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.exam_archive_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.exam_archive_task_sg.id]
    subnets = data.aws_subnet_ids.exam_archive_subnets.ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn  = aws_lb_target_group.exam_archive_lb_target_group.arn
    container_name    = "exam_archive_task"
    container_port    = local.container_port
  }

  depends_on = [
    aws_lb_target_group.exam_archive_lb_target_group
  ]
}