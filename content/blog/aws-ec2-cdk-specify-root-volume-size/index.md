---
title: "How to Specify AWS EC2 Root Volume Size with CDK"
date: "2021-05-12T02:49:14.347Z"

---

Here's how to override the size of the root volume on your AWS EC2 instance using CDK. Not at all obvious!

## Step 1: Check The Root Device Name

Update this command with your region and AMI:

```shell
aws ec2 describe-images --region us-east-1 --image-ids ami-0d5eff06f840b45e9
```

<br/>

In this example output from the `describe-images` command, the device name is `"/dev/xvda"`. The property path
is `.Images[0].BlockDeviceMappings[0].DeviceName`.

```json
{
  "Images": [
    {
      "Architecture": "x86_64",
      "CreationDate": "2021-04-29T10:14:01.000Z",
      "ImageId": "ami-0d5eff06f840b45e9",
      "ImageLocation": "amazon/amzn2-ami-hvm-2.0.20210427.0-x86_64-gp2",
      "ImageType": "machine",
      "Public": true,
      "OwnerId": "137112412989",
      "PlatformDetails": "Linux/UNIX",
      "UsageOperation": "RunInstances",
      "State": "available",
      "BlockDeviceMappings": [
        {
          "DeviceName": "/dev/xvda",
          "Ebs": {
            "DeleteOnTermination": true,
            "SnapshotId": "snap-01047646ec075f543",
            "VolumeSize": 8,
            "VolumeType": "gp2",
            "Encrypted": false
          }
        }
      ],
      "Description": "Amazon Linux 2 AMI 2.0.20210427.0 x86_64 HVM gp2",
      "EnaSupport": true,
      "Hypervisor": "xen",
      "ImageOwnerAlias": "amazon",
      "Name": "amzn2-ami-hvm-2.0.20210427.0-x86_64-gp2",
      "RootDeviceName": "/dev/xvda",
      "RootDeviceType": "ebs",
      "SriovNetSupport": "simple",
      "VirtualizationType": "hvm"
    }
  ]
}
```

## Step 2: Use the Root Device Name When Constructing the EC2 Instance

Now build an `BlockDevice` using the root device name from Step 1. Then provide the root block device on
the `blockDevices` property when constructing the EC2 instance.

```typescript
import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export class Ec2Stack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Other setup

    const rootVolume: ec2.BlockDevice = {
      deviceName: '/dev/xvda', // Use the root device name from Step 1
      volume: ec2.BlockDeviceVolume.ebs(50), // Override the volume size in Gibibytes (GiB)
    };

    const instance = new ec2.Instance(this, `${name}-ec2-instance`, {
      // Other properties
      blockDevices: [rootVolume],
    });

  }
}
```

## References

- https://aws.amazon.com/premiumsupport/knowledge-center/cloudformation-root-volume-property/
