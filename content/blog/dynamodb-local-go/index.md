---
title: "How to Connect to DynamoDB Local Using the AWS SDK for Go"
date: "2021-08-27T03:10:00.280Z"

---

Example code demonstrating how to connect to locally running DynamoDB such as 
[DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) 
or [LocalStack](https://localstack.cloud/).

By the way, you can run DynamoDB Local very easily like this:

```shell
docker run -p 8000:8000 amazon/dynamodb-local
```

**Note:** This code uses the [AWS SDK Go v2](https://aws.github.io/aws-sdk-go-v2/docs/).

```go
import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

func CreateLocalClient() *dynamodb.Client {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("us-east-1"),
		config.WithEndpointResolver(aws.EndpointResolverFunc(
			func(service, region string) (aws.Endpoint, error) {
				return aws.Endpoint{URL: "http://localhost:8000"}, nil
			})),
		config.WithCredentialsProvider(credentials.StaticCredentialsProvider{
			Value: aws.Credentials{
				AccessKeyID: "dummy", SecretAccessKey: "dummy", SessionToken: "dummy",
				Source: "Hard-coded credentials; values are irrelevant for local DynamoDB",
			},
		}),
	)
	if err != nil {
		panic(err)
	}

	return dynamodb.NewFromConfig(cfg)
}
```

See full code on [GitHub](https://github.com/helloworldless/go-dynamodb-reference) 
which also has examples of:

- Paginated, full-table `Scan` using `ExclusiveStartKey`
- `CreateTable` but only if the table does not already exist
- Conditional check to prevent overwriting an existing item with a `PutItem` operation
- Logic to check if an SDK `error` is due to a condition check failure (`ConditionalCheckFailed`)


One more bonus: There are many more examples of configuring the client here, 
[aws-sdk-go-v2/config/example_test.go](https://github.com/aws/aws-sdk-go-v2/blob/2c11b4fca7da348c7983bb8cbfeccc87b2dcbcd1/config/example_test.go)
