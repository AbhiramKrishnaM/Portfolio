<template>
  <div class="file-content flex">
    <!-- Line numbers -->
    <div class="line-numbers py-4 pr-2 text-right text-gray-500 select-none">
      <div v-for="n in 16" :key="n" class="text-xs px-2">{{ n }}</div>
    </div>

    <!-- File content -->
    <div class="code-content py-4 pl-4">
      <pre class="font-mono whitespace-pre">
# AWS Services

- EC2: Virtual servers in the cloud
- S3: Scalable storage in the cloud
- Lambda: Run code without thinking about servers
- DynamoDB: Managed NoSQL database
- CloudFront: Global content delivery network
- Route 53: Scalable DNS and domain name registration
- RDS: Managed relational database service
- SQS: Message queuing service
- SNS: Notification service
- CloudWatch: Monitoring and observability
- IAM: Identity and access management
- ECS: Highly scalable container orchestration
- EKS: Managed Kubernetes service
      </pre>
    </div>
  </div>
</template>
