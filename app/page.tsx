'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type FormInputs = {
  email: string;
  password: string;
  msg: string;
};

enum FormStatus {
  READY = 'READY',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();
  const [status, setStatus] = useState<FormStatus>(FormStatus.READY);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (status === FormStatus.LOADING) return;
    setStatus(FormStatus.LOADING);

    const result = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!result.ok) {
      setStatus(FormStatus.ERROR);
      return;
    }
    setStatus(FormStatus.SUCCESS);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='w-full p-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-center mb-8'>
        <h1 className='text-4xl font-extrabold mb-2'>WAPL 봇 테스트</h1>
        <h3 className='text-xl font-light'>
          자신의 WAPL 방으로 테스트 메시지를 전송합니다.
        </h3>
      </header>
      <main className='flex flex-col items-center justify-center p-6 text-gray-800'>
        <div className='flex flex-col lg:flex-row lg:space-x-12 w-full max-w-6xl'>
          <section className='w-full lg:w-1/2 mb-8 lg:mb-0'>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='w-full p-8 bg-white rounded-lg shadow-2xl space-y-8'
            >
              <div className='flex flex-col'>
                <label className='mb-2 text-sm font-semibold text-gray-700'>
                  WAPL 이메일
                </label>
                <input
                  {...register('email', {
                    required: '이메일을 입력해주세요.',
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i,
                      message: '유효한 이메일 주소를 입력해주세요.',
                    },
                  })}
                  type='email'
                  className='w-full bg-gray-100 text-gray-800 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
                {errors.email && (
                  <span className='text-red-500 text-sm mt-1'>
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div className='flex flex-col'>
                <label className='mb-2 text-sm font-semibold text-gray-700'>
                  WAPL 비밀번호
                </label>
                <input
                  {...register('password', {
                    required: '비밀번호를 입력해주세요.',
                  })}
                  type='password'
                  className='w-full bg-gray-100 text-gray-800 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
                {errors.password && (
                  <span className='text-red-500 text-sm mt-1'>
                    {errors.password.message}
                  </span>
                )}
              </div>
              <div className='flex flex-col'>
                <label className='mb-2 text-sm font-semibold text-gray-700'>
                  테스트 메시지
                </label>
                <input
                  {...register('msg', { required: '메세지를 입력해주세요.' })}
                  type='text'
                  className='w-full bg-gray-100 text-gray-800 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
                {errors.msg && (
                  <span className='text-red-500 text-sm mt-1'>
                    {errors.msg.message}
                  </span>
                )}
              </div>
              <input
                type='submit'
                value='WAPL봇 테스트'
                className='w-full px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={status === FormStatus.LOADING}
              />
            </form>
            <div className='w-full mt-4'>
              {status === FormStatus.LOADING && (
                <div className='text-gray-500'>전송 중...</div>
              )}
              {status === FormStatus.SUCCESS && (
                <div className='text-green-500'>전송 완료!</div>
              )}
              {status === FormStatus.ERROR && (
                <div className='text-red-500'>전송 실패!</div>
              )}
            </div>
          </section>
          <section className='w-full lg:w-1/2 p-8 bg-white rounded-lg shadow-2xl'>
            <div className='text-2xl font-bold mb-4'>API 사용 명세</div>
            <div className='text-gray-700 space-y-4'>
              <div>
                <p className='mb-1'>
                  <span className='font-semibold'>POST</span>
                </p>
                <p className='pl-4'>
                  <span className='font-semibold'>URL:</span> /api
                </p>
              </div>
              <div>
                <p className='mb-1'>
                  <span className='font-semibold'>Body:</span>
                </p>
                <pre className='bg-gray-100 p-4 rounded-lg mb-2'>
                  <code>
                    {`{
  email: 'string',    // WAPL 이메일
  password: 'string', // WAPL 비밀번호 
  msg: 'string',      // 봇이 전송할 메시지
  roomUrl?: 'string'  // WAPL 방 URL 
                        (default: 자신의 WAPL 방)
}`}
                  </code>
                </pre>
              </div>
              <div>
                <p className='mb-1'>
                  <span className='font-semibold'>Response:</span>
                </p>
                <pre className='bg-gray-100 p-4 rounded-lg'>
                  <code>
                    {`{
  201: '완료되었습니다.', // 성공
  500: '에러 메시지'     // 실패
}`}
                  </code>
                </pre>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
