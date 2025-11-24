<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use FFMpeg\FFMpeg;
use FFMpeg\Format\Video\X264;
use App\Models\Card;
use App\Models\CardCover;
class VideoController extends Controller
{
    public function upload(Request $request, Card $card)
    {
        try{

            $validator = \Validator::make($request->all(), [
                'label' => 'required|string|in:avatar,cover',
                'file' => 'required|mimes:mp4,mov,avi|max:204800', // 200MB limit
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            $label = $request->input('label');

            // $video_basename = $label.'-video-'.$card->id.'.mp4';
            // $thumbnail_basename = $label.'-thumbnail-'.$card->id.'.jpg';

            $uuid = \Str::uuid();
            $video_basename = "{$label}-video-{$card->id}-{$uuid}.mp4";
            $thumbnail_basename = "{$label}-thumbnail-{$card->id}-{$uuid}.jpg";

            // create directories if they don't exist
            if (!file_exists(storage_path('app/public/raw_videos'))) {
                mkdir(storage_path('app/public/raw_videos'), 0777, true);
            }
            if (!file_exists(storage_path('app/public/videos'))) {
                mkdir(storage_path('app/public/videos'), 0777, true);
            }
            if (!file_exists(storage_path('app/public/thumbnails'))) {
                mkdir(storage_path('app/public/thumbnails'), 0777, true);
            }
            if (file_exists(storage_path('app/public/videos/'.$video_basename))) {   
                unlink(storage_path('app/public/videos/'.$video_basename));
            }
            if (file_exists(storage_path('app/public/thumbnails/'.$thumbnail_basename))) {
                unlink(storage_path('app/public/thumbnails/'.$thumbnail_basename));
            }

            // Store original video
            $video = $request->file('file');
            $originalName = time() . '.' . $video->getClientOriginalExtension();
            $videoPath = $video->move(storage_path('app/public/raw_videos'), $originalName);

            // Set paths to convert video to mp4
            $inputPath = storage_path('app/public/raw_videos/' . $originalName);
            $outputPath = storage_path('app/public/videos/'.$video_basename);

            // Convert video to MP4 (H.264/AAC)
            $ffmpeg = FFMpeg::create();
            $videoFile = $ffmpeg->open($inputPath);
            $format = new X264('aac', 'libx264'); // MP4 format
            $format->setKiloBitrate(1000); // Set video bitrate for optimization

            $videoFile->save($format, $outputPath);


            // Generate thumbnail
            $thumbnailName = time() . '.jpg';
            $thumbnailPath = storage_path('app/public/thumbnails/' . $thumbnail_basename);


            $ffmpeg = FFMpeg::create();
            $videoFile = $ffmpeg->open($inputPath);
            $videoFile->frame(\FFMpeg\Coordinate\TimeCode::fromSeconds(2))
                    ->save($thumbnailPath);
            
            unlink($inputPath);

            $videoUrl = asset('storage/videos/' . $video_basename);
            $thumbnailUrl = asset('storage/thumbnails/' . $thumbnail_basename);

            $cover = null;
            if($label == 'cover'){
                $cover = CardCover::where('user_id', $request->user()->id)->where('type', 'video')->where('thumbnail', $thumbnailUrl)->first();
                if(!$cover){
                    $cover = new CardCover();
                    $cover->user_id = $request->user()->id;
                    $cover->url = $videoUrl;
                    $cover->thumbnail = $thumbnailUrl;
                    $cover->type = 'video';
                    $cover->save();
                }
            }
            return response()->json([
                'success' => true,
                'video_url' => $videoUrl,
                'thumbnail' => $thumbnailUrl,
                'cover' => $cover,
            ]);

            // if ($label == 'cover') {

            //     $userId = $request->user()->id;
            
            //     // Find any existing video cover for this user
            //     $existingCover = CardCover::where('user_id', $userId)
            //         ->where('type', 'video')
            //         ->first();
            
            //     if ($existingCover) {
            
            //         // Delete old video file
            //         $oldVideoPath = str_replace(asset('storage/'), storage_path('app/public/'), $existingCover->url);
            //         if (file_exists($oldVideoPath)) {
            //             unlink($oldVideoPath);
            //         }
            
            //         // Delete old thumbnail file
            //         $oldThumbnailPath = str_replace(asset('storage/'), storage_path('app/public/'), $existingCover->thumbnail);
            //         if (file_exists($oldThumbnailPath)) {
            //             unlink($oldThumbnailPath);
            //         }
            
            //         // Update the existing record with new video/thumbnail URLs
            //         $existingCover->url = $videoUrl;
            //         $existingCover->thumbnail = $thumbnailUrl;
            //         $existingCover->save();
            
            //         $cover = $existingCover;
            
            //     } else {
            
            //         // Create a new cover record for the user
            //         $cover = new CardCover();
            //         $cover->user_id = $userId;
            //         $cover->url = $videoUrl;
            //         $cover->thumbnail = $thumbnailUrl;
            //         $cover->type = 'video';
            //         $cover->save();
            //     }
            
            //     return response()->json([
            //         'success' => true,
            //         'video_url' => $videoUrl,
            //         'thumbnail' => $thumbnailUrl,
            //         'cover' => $cover,
            //     ]);
            // }
            

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}