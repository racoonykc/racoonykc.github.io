---
layout: blog-post
title: "JustQuant: You Don't Need Smoothing, SVD, or Rotation for 4-Bit Activation Quantization"
description: Notes on plain low-bit operators and progressive distillation.
date: 2026-09-29 00:00:00 +0800
permalink: /blog/justquant/
author: Kaicheng Yang
series: Research notes
project_url: /projects/justquant/
paper_url: https://arxiv.org/pdf/2609.33601
related_posts: false
---

There is a familiar moment in quantization research. A new paper arrives with a smaller model, a lower bit width, and a larger speedup number. The table looks better than the last table. Then someone asks the practical question:

> Where is the kernel?

The answer is often less satisfying. The model may need a rotation before the matrix multiplication, a low-rank correction after it, a smoothing pass around it, or a numerical format that only one expensive accelerator supports well. The paper reports a compact model. The deployed system inherits a small software stack.

This is the gap that motivated **JustQuant**.

## The bit width is not the whole story

Low-bit research has made remarkable progress. But the distance between an academic operator and a useful deployment primitive has also become more visible. An activation-quantized model can be four bits on paper and still require a sequence of transformations that are difficult to fuse, difficult to port, and difficult to make fast on the hardware people actually own.

That matters because the world is larger than the newest data-center GPU. Many users work with an older NVIDIA card, a workstation accelerator, or a domestic device whose software stack does not contain a hand-tuned kernel for every new operator. A method that depends on a special implementation can be excellent on one machine and nearly unusable on another.

The problem is not that SVD, rotations, smoothing, or new number formats are intrinsically wrong. They can be useful tools. The problem is that every additional operation becomes part of the deployment contract. Somebody has to implement it, fuse it, benchmark it, port it, and keep it working as the hardware changes.

So we asked a deliberately plain question:

> Can a model be trained to live inside a network made of ordinary low-bit matrix multiplications?

By “ordinary,” we mean a naive W4A4 or W1.58A4 matrix operator: no rotation, no SVD branch, no smoothing pass at inference. The complexity, if it is necessary, should move into training. The deployed graph should remain easy to recognize.

## JustQuant

JustQuant is a training recipe for that trade. It uses **progressive distillation** to teach a quantized student to preserve the behavior of a full-precision teacher while the student is already constrained to its low-bit body.

The central idea is simple. Do not ask a small, fragile quantized model to imitate the entire teacher in one jump. First make short quantized segments behave correctly. Then lengthen the segment. Then lengthen it again. Local supervision grows into global supervision.

<figure>
  <a href="{{ '/assets/img/justquant/theseus-qad.png' | relative_url }}" target="_blank" rel="noopener">
    <img src="{{ '/assets/img/justquant/theseus-qad.png' | relative_url }}" alt="Theseus QAD grows quantized segments from local blocks to the whole model." loading="lazy">
  </a>
  <figcaption>Theseus QAD: the student changes its material one segment at a time, while the teacher keeps the behavior anchored.</figcaption>
</figure>

The name is a reference to the Ship of Theseus. If every plank is replaced, what makes the ship the same ship? For a model, the practical version is: if every computation is replaced by a low-bit one, what makes the model retain the same intelligence?

## A plain operator can be a strong one

The first answer comes from FLUX.1, a 12-billion-parameter text-to-image model. With naive W4A4, JustQuant reaches **17.62 FID** and **0.993 ImageReward** on FLUX.1-schnell. The full-precision BF16 reference is 19.15 FID and 0.959 ImageReward. On the tested baselines, the plain operator is competitive with, and on these metrics better than, methods that add rotation or SVD transformations.

On FLUX.1-dev, the same naive W4A4 recipe reaches **20.21 FID** and **0.956 ImageReward**, close to the BF16 reference of 20.26 and 0.958. This is not a special hardware format. It is a conventional low-bit matrix path that can be implemented wherever the underlying W4A4 GEMM is available.

<figure>
  <a href="{{ '/assets/img/justquant/flux-comparison.png' | relative_url }}" target="_blank" rel="noopener">
    <img src="{{ '/assets/img/justquant/flux-comparison.png' | relative_url }}" alt="FLUX visual comparisons across BF16, ConvRot, SVDQuant, and JustQuant." loading="lazy">
  </a>
  <figcaption>Visual comparisons from the FLUX experiments. The point is not that every image is identical; it is that a plain W4A4 path can remain useful without adding operators around the GEMM.</figcaption>
</figure>

The training cost is also part of the story. The FLUX experiments took roughly 18 hours on four H200 GPUs. That is a meaningful cost, but it is often a more portable investment than writing and maintaining a new deployment kernel for every combination of operator and machine.

## The smaller model is the harder test

Large models have redundancy. Small models have less room to hide a bad approximation. This is where quantization-aware distillation often becomes unpredictable: a method that behaves well on a large transformer can collapse when the model is only 0.6B parameters.

We tested this regime with DiT-XL/2 on ImageNet 256. Plain W4A4 reaches **6.48 FID-10K**, compared with 6.78 for the full-precision reference. At W1.58A4, JustQuant reaches **3.30 FID-50K** and recovers the diversity that is often lost when activation precision is pushed this low. It does so without a Hadamard rotation.

That last detail matters. A low FID score from a narrow set of images is not enough if the model has quietly stopped exploring the distribution. Quantization should compress the representation, not collapse the imagination.

Although JustQuant was first designed for low-bit activation quantization, it is not limited to that setting. We can also use it for pure ternary distillation. Compared with the earlier TerDiT implementation, our method achieves substantial speedups while obtaining better results. In other words, local-to-global distillation can support both low-bit activation models such as W1.58A4 and fully ternarized models.

<figure>
  <a href="{{ '/assets/img/justquant/dit-comparison-01.png' | relative_url }}" target="_blank" rel="noopener">
    <img src="{{ '/assets/img/justquant/dit-comparison-01.png' | relative_url }}" alt="DiT W1.58A4 samples for full precision, direct QAT, RobuQ, and JustQuant." loading="lazy">
  </a>
  <figcaption>DiT-XL/2 visual comparisons at W1.58A4. Rows show full precision, direct QAT, RobuQ, and JustQuant.</figcaption>
</figure>

## Local first, global later

Why should progressive distillation help where ordinary QAD becomes unstable? The paper points to three connected reasons.

**First, training stability.** Activation quantization makes optimization intrinsically unstable. Longer low-bit paths contain more stacked straight-through estimator (STE) approximations, so starting with end-to-end distillation can easily cause training to fail. Shorter quantized segments keep the initial optimization problem within a more stable range before the supervised path expands.

**Second, model alignment.** Extremely low-bit entries cannot match their full-precision counterparts exactly, while their composition can still approximate the overall transformation. An overly local target may therefore over-constrain intermediate values that the quantized network does not need to preserve. What needs to align is the composed transformation and the resulting behavior, not every intermediate number.

**Third, distillation density.** Lower-level targets expose more intermediate states and provide denser supervision, allowing the student to receive useful updates more quickly. Global distillation provides the sparsest signal and is therefore the slowest to optimize. Local targets give training a denser signal before the supervision gradually expands to the whole model.

JustQuant follows this progression: we begin with short quantized segments and match them to the corresponding full-precision teacher behavior. Once a segment is reliable, we extend the supervised path. The target remains the teacher, but the student solves a sequence of problems whose scope grows over time.

This is why we call the method **local-to-global distillation**. “Local” does not mean the final model is trained only on local objectives. It means the training signal first becomes stable, dense, and alignable, then gradually acquires global reach. Complexity moves into training, while inference can remain simple.

## Simplicity is a systems contribution

There is a tendency to treat an operator as a mathematical detail and a kernel as an implementation detail. In low-bit inference, that separation breaks down. The operator determines the shape of the deployment problem.

A plain GEMM has an enormous advantage: it is a common language between models and hardware. It can be optimized by different vendors, mapped to different instruction sets, and improved without changing the training recipe. The best kernel is still valuable, but the ecosystem does not have to begin from zero.

This is especially important outside the narrow path of the newest NVIDIA cards. If a domestic accelerator vendor has a fast W4A4 GEMM, JustQuant gives that vendor a model whose inference graph is already aligned with the primitive they can support. The method does not require every manufacturer to reproduce one special SVD-plus-rotation kernel before users can benefit.

The result is a different kind of portability. We are not promising that all cards will have identical speed. We are saying that the model should ask for a capability that many cards can plausibly provide.

## Were we solving the wrong problem?

Looking back, it is possible that we spent too long asking how to make complicated low-bit operators fast, when we should also have asked whether the model could learn to avoid them.

This is not an argument against the last two years of quantization research. Those methods taught us what the low-bit regime makes difficult. They exposed the role of outliers, the fragility of activation distributions, and the limits of naive training. JustQuant stands on top of that knowledge.

But research directions have inertia. Once a transformation becomes a standard ingredient, the field can start optimizing the ingredient instead of questioning the recipe. The fact that an operation is mathematically elegant does not mean it belongs in every deployed model.

Perhaps the more useful question is not “how many bits can we remove?” It is:

> What is the smallest set of operations that can carry the behavior we care about across the hardware we actually have?

## What this could make possible

If the premise holds, several consequences follow.

First, quantization becomes less dependent on a single vendor’s numerical formats. NVFP4 and similar representations are exciting, but a method whose core requirement is plain low-bit GEMM can reach more machines and more users.

Second, hardware vendors outside the dominant CUDA ecosystem get a clearer target. They do not need to support every research operator at once. A reliable W4A4 or W1.58A4 path could already unlock useful models.

Third, model researchers can treat deployability as part of the scientific objective. A result is not only its compression ratio or benchmark score. It is also the number of assumptions a user must satisfy before the model runs well.

Finally, there is a philosophical possibility. Intelligence may be less attached to the precise material of a model than we assume. If a model can change from dense floating-point computation to a sequence of plain 4-bit operations and retain its behavior, then some of what we call “the model” lives in the organization of computation, not in the precision of every individual number.

That does not make precision irrelevant. It changes the question. Precision is one material. Training is the process that teaches the system which structure must survive when the material changes.

## The road ahead

JustQuant is not the final word on low-bit inference. The current experiments focus on a set of image and diffusion-language models, and practical deployment still depends on packing, memory movement, kernel quality, and hardware-specific details. A plain operator is a better starting point, not a guarantee of speed on every device.

We are releasing the project in that spirit. The paper and project page describe the method and results; weights, training code, inference code, and reproduction materials are coming soon.

The broader hope is simple: a low-bit model should be allowed to be small without becoming exotic. If a model can keep its intelligence inside an ordinary operator, then more people can run it, more hardware can support it, and more research can happen after the paper ends.

Maybe that is the real measure of a quantization method. Not how much machinery it adds to make a model small, but how little machinery a model needs to remain itself.
