// hello.cc
#include <iostream>
#include <node.h>
#include <node_buffer.h>
#include <windows.h>
#include "include/zkinterface.h"
#include "include/libzkfperrdef.h"
#include "include/libzkfptype.h"
#include "include/libzkfp.h"

using namespace std;
using namespace v8;
using namespace node;

HANDLE device;
HANDLE DB;

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(
      isolate, "world", NewStringType::kNormal).ToLocalChecked());
}

void zkfpm_init(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	Local<Number> status = Number::New(isolate, ZKFPM_Init());
  args.GetReturnValue().Set(status);
}

void zkfpm_terminate(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	Local<Number> status = Number::New(isolate, ZKFPM_Terminate());
  args.GetReturnValue().Set(status);
}

void zkfpm_open_device(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	int index = args[0].As<Number>()->Value();
	device = ZKFPM_OpenDevice(index);
	unsigned long longDevice = PtrToUlong(device);
  args.GetReturnValue().Set(Number::New(isolate, longDevice));
}

void zkfpm_close_device(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(Number::New(isolate, ZKFPM_CloseDevice(device)));
}

void zkfpm_db_init(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	DB = ZKFPM_DBInit();
	Local<Number> db = Number::New(isolate, PtrToUlong(ZKFPM_DBInit()));
  args.GetReturnValue().Set(db);
}

void zkfpm_set_parameters(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	if (args.Length() < 3) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }

	int code = args[0].As<Number>()->Value();
	int paramValue = args[1].As<Number>()->Value();
	unsigned int size = args[2].As<Number>()->Value();

	int status = ZKFPM_SetParameters(device, code, (unsigned char*)&paramValue, size);

  Local<Context> context = isolate->GetCurrentContext();

	Local<Object> result = Object::New(isolate);
	result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
	result->Set(context, String::NewFromUtf8(isolate, "value", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, paramValue));
	result->Set(context, String::NewFromUtf8(isolate, "size", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, size));
  args.GetReturnValue().Set(result);
}

void zkfpm_get_parameters(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	if (args.Length() < 3) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }

	int code = args[0].As<Number>()->Value();
	int paramValue = args[1].As<Number>()->Value();
	unsigned int size = args[2].As<Number>()->Value();

	int status = ZKFPM_GetParameters(device, code, (unsigned char*)&paramValue, &size);

  Local<Context> context = isolate->GetCurrentContext();
  
	Local<Object> result = Object::New(isolate);
	result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
	result->Set(context, String::NewFromUtf8(isolate, "value", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, paramValue));
	result->Set(context, String::NewFromUtf8(isolate, "size", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, size));
  args.GetReturnValue().Set(result);
}

void zkfpm_acquire_fingerprint(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	if (args.Length() < 2) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }

	unsigned int cbFPImage = args[0].As<Number>()->Value();
	unsigned char* fpImage = new unsigned char[cbFPImage];

	unsigned int cbTemplate = args[1].As<Number>()->Value();
	unsigned char* fpTemplate = new unsigned char[cbTemplate];

	int status = ZKFPM_AcquireFingerprint(device, fpImage, cbFPImage, fpTemplate, &cbTemplate);

  Local<Context> context = isolate->GetCurrentContext();

	Local<Object> result = Object::New(isolate);
	result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
	result->Set(
    context,
    String::NewFromUtf8(isolate, "image", NewStringType::kNormal).ToLocalChecked(),
    Buffer::Copy(isolate, (const char *)fpImage, cbFPImage).ToLocalChecked()
  );
	result->Set(
    context,
    String::NewFromUtf8(isolate, "template", NewStringType::kNormal).ToLocalChecked(),
    Buffer::Copy(isolate, (const char *)fpTemplate,  cbTemplate).ToLocalChecked()
  );
	result->Set(context, String::NewFromUtf8(isolate, "template_size", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, cbTemplate));
  args.GetReturnValue().Set(result);
}

void zkfpm_db_match(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  if (args.Length() < 3) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }
  unsigned char* m_arrPreRegTemps = reinterpret_cast<unsigned char*>(Buffer::Data(args[0]));
  unsigned int m_arrPreTempsLen = args[1].As<Number>()->Value();
  unsigned char* temp =  reinterpret_cast<unsigned char*>(Buffer::Data(args[2]));
  unsigned int cbTemplate = args[3].As<Number>()->Value();

  int status = ZKFPM_DBMatch(DB, m_arrPreRegTemps, m_arrPreTempsLen, temp, cbTemplate);

  Local<Context> context = isolate->GetCurrentContext();
	Local<Object> result = Object::New(isolate);
  result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
  args.GetReturnValue().Set(result);
}

void zkfpm_db_merge(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	if (args.Length() < 4) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }

	unsigned char* RegTemp_1 = reinterpret_cast<unsigned char*>(Buffer::Data(args[0]));
	unsigned char* RegTemp_2 = reinterpret_cast<unsigned char*>(Buffer::Data(args[1]));
	unsigned char* RegTemp_3 = reinterpret_cast<unsigned char*>(Buffer::Data(args[2]));
//	unsigned char* temp = reinterpret_cast<unsigned char*>(Buffer::Data(args[3]));
	unsigned int cbTemplate = args[3].As<Number>()->Value();
	unsigned char* temp = new unsigned char[cbTemplate];

	int status = ZKFPM_DBMerge(DB, RegTemp_1, RegTemp_2, RegTemp_3, temp, &cbTemplate);

  Local<Context> context = isolate->GetCurrentContext();

	Local<Object> result = Object::New(isolate);
	result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
	result->Set(
      context,
      String::NewFromUtf8(isolate, "template", NewStringType::kNormal).ToLocalChecked(),
      Buffer::Copy(isolate, (const char *)temp, cbTemplate).ToLocalChecked()
  );
  args.GetReturnValue().Set(result);
}

void zkfpm_db_add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	if (args.Length() < 3) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  unsigned int id = args[0].As<Number>()->Value();
	unsigned char* temp = reinterpret_cast<unsigned char*>(Buffer::Data(args[1]));
	unsigned int cbTemplate = args[2].As<Number>()->Value();
//	unsigned char* temp = new unsigned char[cbTemplate];

	int status = ZKFPM_DBAdd(DB, id, temp, cbTemplate);

  Local<Context> context = isolate->GetCurrentContext();

	Local<Object> result = Object::New(isolate);
	result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
	result->Set(
    context,
    String::NewFromUtf8(isolate, "template", NewStringType::kNormal).ToLocalChecked(),
    Buffer::Copy(isolate, (const char *)temp, cbTemplate).ToLocalChecked()
  );
  args.GetReturnValue().Set(result);
}

void zkfpm_db_identify(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	if (args.Length() < 2) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }

//	unsigned char* temp = reinterpret_cast<unsigned char*>(Buffer::Data(args[0]));
	unsigned char* temp = reinterpret_cast<unsigned char*>(Buffer::Data(args[0]));
	unsigned int len = args[1].As<Number>()->Value();
	unsigned int id = 0;
	unsigned int score = 0;

	int status = ZKFPM_DBIdentify(DB, temp, len, &id, &score);

  Local<Context> context = isolate->GetCurrentContext();
  
	Local<Object> result = Object::New(isolate);
	result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
	result->Set(context, String::NewFromUtf8(isolate, "id", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, id));
	result->Set(context, String::NewFromUtf8(isolate, "score", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, score));
  args.GetReturnValue().Set(result);
}

void zkfpm_db_del(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

	if (args.Length() < 1) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, "Wrong number of arguments",NewStringType::kNormal).ToLocalChecked()));
    return;
  }

  unsigned int id = args[0].As<Number>()->Value();

	int status = ZKFPM_DBDel(DB, id);

  Local<Context> context = isolate->GetCurrentContext();

	Local<Object> result = Object::New(isolate);
	result->Set(context, String::NewFromUtf8(isolate, "status", NewStringType::kNormal).ToLocalChecked(),  Number::New(isolate, status));
  args.GetReturnValue().Set(result);
}

void Initialize(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
  NODE_SET_METHOD(exports, "zkfpm_init", zkfpm_init);
  NODE_SET_METHOD(exports, "zkfpm_terminate", zkfpm_terminate);
  NODE_SET_METHOD(exports, "zkfpm_open_device", zkfpm_open_device);
  NODE_SET_METHOD(exports, "zkfpm_close_device", zkfpm_close_device);
  NODE_SET_METHOD(exports, "zkfpm_db_init", zkfpm_db_init);
  NODE_SET_METHOD(exports, "zkfpm_set_parameters", zkfpm_set_parameters);
  NODE_SET_METHOD(exports, "zkfpm_get_parameters", zkfpm_get_parameters);
  NODE_SET_METHOD(exports, "zkfpm_acquire_fingerprint", zkfpm_acquire_fingerprint);
  NODE_SET_METHOD(exports, "zkfpm_db_match", zkfpm_db_match);
  NODE_SET_METHOD(exports, "zkfpm_db_merge", zkfpm_db_merge);
  NODE_SET_METHOD(exports, "zkfpm_db_add", zkfpm_db_add);
  NODE_SET_METHOD(exports, "zkfpm_db_identify", zkfpm_db_identify);
  NODE_SET_METHOD(exports, "zkfpm_db_del", zkfpm_db_del);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)