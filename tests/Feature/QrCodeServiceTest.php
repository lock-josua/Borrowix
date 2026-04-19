<?php

use App\Services\QrCodeService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

test('qr code service generates valid uuid token', function () {
    $service = new QrCodeService;

    $mockModel = \Mockery::mock(Model::class)->makePartial();
    $mockModel->shouldReceive('update')->andReturn(true);

    $token = $service->generateTokenForEquipment($mockModel);

    expect($token)->not->toBeEmpty();
    expect($token)->toHaveLength(36);
    expect(Str::isUuid($token))->toBeTrue();
});

test('qr code token is valid uuid format', function () {
    $service = new QrCodeService;

    $mockModel = \Mockery::mock(Model::class)->makePartial();
    $mockModel->shouldReceive('update')->andReturn(true);

    $token = $service->generateTokenForEquipment($mockModel);

    expect(Str::isUuid($token))->toBeTrue();
});

test('regenerate creates new token', function () {
    $service = new QrCodeService;

    $mockModel = \Mockery::mock(Model::class)->makePartial();
    $mockModel->shouldReceive('update')->andReturn(true);

    $firstToken = $service->generateTokenForEquipment($mockModel);
    $secondToken = $service->regenerateTokenForEquipment($mockModel);

    expect($firstToken)->not->toBe($secondToken);
    expect(Str::isUuid($secondToken))->toBeTrue();
});
