# Vesion control for stable-diffusion-webui

Update time: 20230410

webui/lora 22bcc7be (20230329)
controlnet 187ae880 (20230409)
dreambooth 926ae204 (20230331)

update patch for webui (PR 9319)
    https://github.com/AUTOMATIC1111/stable-diffusion-webui/pull/9319/commits/aef42bfec09a9ca93d1222b7b47256f37e192a32

# How to play with /stable-diffusion-webui

```
accelerate launch --num_cpu_threads_per_process=6 launch.py --api

# How to build docker image for dreambooth training on SageMaker

sh build_and_push_dreambooth_from_scratch.sh Dockerfile.dreambooth.from_scratch aigc-webui-extension