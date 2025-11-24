<?php

namespace App\Service;


use Vimeo\Vimeo;

class VimeoService
{
    protected $vimeo;

    public function __construct()
    {
        $this->vimeo = new Vimeo(
            config('vimeo.client_id'),
            config('vimeo.client_secret'),
            config('vimeo.access_token')
        );
    }

    public function uploadVideo($filePath, $title, $description)
    {
        try {
            // Step 1: Get Upload Link
            $uri = $this->vimeo->upload($filePath, [
                'name' => $title,
                'description' => $description,
                'privacy' => [
                    'view' => 'unlisted' // Set video as unlisted
                ]
            ]);

            // Step 2: Verify Upload
            // $videoData = $this->vimeo->request($uri . '?fields=link');
            // Step 2: Fetch Video Details (Including Thumbnail)
            $videoData = $this->vimeo->request($uri . '?fields=link,pictures.sizes');

            $videoLink = $videoData['body']['link'] ?? null;
            $pictures = $videoData['body']['pictures']['sizes'] ?? [];
            
            // Get the largest available thumbnail
            $thumbnailUrl = count($pictures) > 0 ? end($pictures)['link'] : null;

            return [
                'success' => true,
                'video_link' => $videoLink,
                'thumbnail' => $thumbnailUrl,
                'video_uri' => $uri
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}