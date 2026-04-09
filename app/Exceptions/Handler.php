<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e): Response|JsonResponse|\Symfony\Component\HttpFoundation\Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        if ($e instanceof ValidationException) {
            return parent::render($request, $e);
        }

        if ($e instanceof AccessDeniedHttpException) {
            return $this->handleAccessDenied($request, $e);
        }

        if ($e instanceof AuthenticationException) {
            return $this->handleAuthentication($request, $e);
        }

        if ($e instanceof HttpException && $e->getStatusCode() === 403) {
            return $this->handleAccessDenied($request, $e);
        }

        if ($e instanceof HttpException && $e->getStatusCode() === 404) {
            return $this->handleNotFound($request, $e);
        }

        return parent::render($request, $e);
    }

    private function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        if ($e instanceof AccessDeniedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to perform this action.',
            ], 403);
        }

        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $statusCode = $e instanceof HttpException ? $e->getStatusCode() : 500;

        return response()->json([
            'success' => false,
            'message' => config('app.debug') ? $e->getMessage() : 'Something went wrong.',
        ], $statusCode);
    }

    private function handleAccessDenied(Request $request, Throwable $e): Response|JsonResponse|\Symfony\Component\HttpFoundation\Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to perform this action.',
            ], 403);
        }

        return back()->with('error', 'You are not authorized to perform this action.');
    }

    private function handleAuthentication(Request $request, AuthenticationException $e): Response|JsonResponse|\Symfony\Component\HttpFoundation\Response
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return redirect()->guest(route('login'));
    }

    private function handleNotFound(Request $request, HttpException $e): Response|\Symfony\Component\HttpFoundation\Response
    {
        return back()->with('error', 'The page you are looking for could not be found.');
    }
}
