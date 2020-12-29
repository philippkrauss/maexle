# maexle
serverless implementation of the game maexle

## serverless maexle backend
### deploy / undeploy
`sls deploy -v --stage dev/prod`

`sls remove --stage dev/prod`
### Technical details
#### DynamoDB
The necessary table in AWS DynamoDB is automatically created.

### useful commands

sls deploy -v --stage dev
sls remove --stage dev

### local execution

- install dynamodb: `sls dynamodb install`
- start offline: `sls offline start`

### cleanup

- `sls dynamodb remove`
