// DotEnv(.env) 등 빌드 환경 관련 설정파일

// Node.js 의 path.resolve import
import { resolve } from 'path';

// DotEnv(.env)
import dotenv from 'dotenv';

// 로컬 빌드 여부
export const isDevBuild = ['development', 'devlocal'].includes(
  process.env.NODE_ENV,
);

// 현재 NODE_ENV 값
export const nodeEnv = process.env.NODE_ENV;

// Dotenv 관련 경로 설정
const dotEnvPath = resolve(__dirname);
const dotEnvFileName = `.env.${process.env.NODE_ENV}`;

// .env 파일에 정의한 값들을 process.env 로 로드하여 접근가능하도록 한다.
dotenv.config({
  path: resolve(dotEnvPath, dotEnvFileName),
});

// dotenv option
export const dotEnvOption = { path: dotEnvPath, filename: dotEnvFileName };
