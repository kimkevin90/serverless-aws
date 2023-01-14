"use strict";
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({
  region: "ap-northeast-2",
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};

module.exports.createNote = async (event, context, cb) => {
  /* 
  최적화 1
  nodejs의 이벤트 루프로 인해 cb는 await documentClient.put(params).promise();
  끝난 후 결과를 제공한다. 이때 cb는 기다리지 않고 바로 호출 가능하다.
  context.callbackWaitsForEmptyEventLoop = false;
  */
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);
  try {
    const params = {
      // TableName: NOTES_TABLE_NAME,
      TableName: "notes",
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      // 동일한 notesId 사용 막기
      ConditionExpression: "attribute_not_exists(notesId)",
    };

    /*
    최적화 2
    sdk 사용에 따라 http요청(dynamoDB)을 하게 되고 핸드쉐이크 과정이 발생한다.
    해결책 http keep alive 사용 ~ 이전에 열린 연결을 재사용
    AWS_NODEJS_CONNECTION_REUSE_ENABLED: 1
    */
    await documentClient.put(params).promise();
    cb(null, send(201, data));
  } catch (err) {
    cb(null, send(500, err.message));
  }
};

module.exports.updateNote = async (event, context, cb) => {
  let notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(notesId)",
    };
    await documentClient.update(params).promise();
    cb(null, send(200, data));
  } catch (err) {
    cb(null, send(500, err.message));
  }
};

module.exports.deleteNote = async (event, context, cb) => {
  let notesId = event.pathParameters.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)",
    };
    await documentClient.delete(params).promise();
    cb(null, send(200, notesId));
  } catch (err) {
    cb(null, send(500, err.message));
  }
};

module.exports.getAllNotes = async (event, context, cb) => {
  console.log(JSON.stringify(event));
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    };
    const notes = await documentClient.scan(params).promise();
    cb(null, send(200, notes));
  } catch (err) {
    cb(null, send(500, err.message));
  }
};
