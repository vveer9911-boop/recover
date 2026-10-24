package com.recover.installer

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import kotlin.math.*

/**
 * 3D Dotted Thinking Orbs Loader faithfully ported from Jakubantalik/thinking-orbs (orbits mode).
 * Uses orthographic 3D projection (makeProj), tilted orbital planes, depth-shaded dots,
 * and traveling particles. Smoothly transitions to completed success state.
 */
class ThinkingOrbsView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    enum class State {
        IDLE,
        UPDATING,
        COMPLETED
    }

    private var currentState = State.IDLE
    private var animTime = 0f
    private var completionProgress = 0f
    private var animator: ValueAnimator? = null
    private var completionAnimator: ValueAnimator? = null

    private val dotPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val checkPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
        color = Color.parseColor("#10B981")
    }

    private data class ProjectedDot(
        val x: Float,
        val y: Float,
        val z: Float,
        val r: Float,
        val alpha: Float,
        val color: Int
    )

    private fun hashD(a: Double, b: Double): Double {
        val h = sin(a * 12.9898 + b * 78.233) * 43758.5453
        return h - floor(h)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        startAnimation()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        stopAnimation()
    }

    fun startUpdating() {
        currentState = State.UPDATING
        completionProgress = 0f
        startAnimation()
        invalidate()
    }

    fun complete(onFinished: (() -> Unit)? = null) {
        currentState = State.COMPLETED
        completionAnimator?.cancel()
        completionAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 450
            addUpdateListener {
                completionProgress = it.animatedValue as Float
                invalidate()
            }
            start()
        }
    }

    fun setCompleted() {
        complete()
    }

    fun reset() {
        currentState = State.IDLE
        completionProgress = 0f
        invalidate()
    }

    private fun startAnimation() {
        if (animator?.isRunning == true) return
        animator = ValueAnimator.ofFloat(0f, 1000f).apply {
            duration = 100000
            repeatCount = ValueAnimator.INFINITE
            interpolator = LinearInterpolator()
            addUpdateListener {
                animTime = (it.animatedValue as Float) * 0.05f
                invalidate()
            }
            start()
        }
    }

    private fun stopAnimation() {
        animator?.cancel()
        animator = null
        completionAnimator?.cancel()
        completionAnimator = null
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0f || h <= 0f) return

        val size = min(w, h)
        val cx = w / 2f
        val cy = h / 2f
        val rBase = (size / 2f) * 0.82f

        if (currentState == State.COMPLETED) {
            drawCompletedState(canvas, cx, cy, size)
            return
        }

        // Exact math from Jakubantalik/thinking-orbs (orbits.ts)
        val t = animTime.toDouble()
        val yaw = t * 0.12
        val tilt = 0.3
        val sy = sin(yaw)
        val cyw = cos(yaw)
        val st = sin(tilt)
        val ct = cos(tilt)

        val dots = mutableListOf<ProjectedDot>()
        val orbitN = 8
        val ghostN = 24
        val particles = 2

        for (orb in 0 until orbitN) {
            val h1 = hashD(orb.toDouble(), 1.7)
            val h2 = hashD(orb.toDouble(), 5.2)
            val h3 = hashD(orb.toDouble(), 8.9)
            val ro = rBase * (0.45 + 0.52 * h1)
            val th = h1 * 2.0 * Math.PI
            val phi = acos(2.0 * h2 - 1.0)

            val nx = sin(phi) * cos(th)
            val ny = cos(phi)
            val nz = sin(phi) * sin(th)
            var ux = -ny
            var uy = nx
            val uz = 0.0
            val ul = max(1e-6, sqrt(ux * ux + uy * uy))
            ux /= ul
            uy /= ul
            val vx = ny * uz - nz * uy
            val vy = nz * ux - nx * uz
            val vz = nx * uy - ny * ux
            val speed = (0.25 + 0.55 * h3) * (if (h3 > 0.5) 1.0 else -1.0)

            // Ghost path dots
            for (k in 0 until ghostN) {
                val a = (k.toDouble() / ghostN.toDouble()) * 2.0 * Math.PI
                val ox = (ux * cos(a) + vx * sin(a)) * ro
                val oy = (uy * cos(a) + vy * sin(a)) * ro
                val oz = (uz * cos(a) + vz * sin(a)) * ro

                // makeProj
                val x1 = ox * cyw + oz * sy
                val z1 = -ox * sy + oz * cyw
                val y1 = oy * ct - z1 * st
                val z2 = oy * st + z1 * ct

                val px = (cx + x1).toFloat()
                val py = (cy - y1).toFloat()
                val depth = (((z2 / ro) + 1.0) / 2.0).coerceIn(0.0, 1.0).toFloat()

                val dotR = max(1.2f, 2.0f * (0.4f + 0.6f * depth))
                val alpha = (0.35f * (0.3f + 0.7f * depth)).coerceIn(0.05f, 0.9f)
                dots.add(ProjectedDot(px, py, z2.toFloat(), dotR, alpha, Color.parseColor("#38BDF8")))
            }

            // Traveling active particles
            for (m in 0 until particles) {
                val a = t * speed + (m.toDouble() / particles.toDouble()) * 2.0 * Math.PI + h2 * 6.0
                val ox = (ux * cos(a) + vx * sin(a)) * ro
                val oy = (uy * cos(a) + vy * sin(a)) * ro
                val oz = (uz * cos(a) + vz * sin(a)) * ro

                val x1 = ox * cyw + oz * sy
                val z1 = -ox * sy + oz * cyw
                val y1 = oy * ct - z1 * st
                val z2 = oy * st + z1 * ct

                val px = (cx + x1).toFloat()
                val py = (cy - y1).toFloat()
                val depth = (((z2 / ro) + 1.0) / 2.0).coerceIn(0.0, 1.0).toFloat()

                val dotR = max(2.5f, 4.5f * (0.5f + 0.8f * depth))
                val alpha = (0.7f + 0.3f * depth).coerceIn(0.1f, 1.0f)
                dots.add(ProjectedDot(px, py, z2.toFloat(), dotR, alpha, Color.WHITE))
            }
        }

        // Z-sort: draw back to front
        dots.sortBy { it.z }

        for (d in dots) {
            dotPaint.color = d.color
            dotPaint.alpha = (d.alpha * 255).toInt()
            canvas.drawCircle(d.x, d.y, d.r, dotPaint)
        }
    }

    private fun drawCompletedState(canvas: Canvas, cx: Float, cy: Float, size: Float) {
        val p = completionProgress
        val ringR = (size * 0.32f) * p

        // Emerald outer check ring
        checkPaint.strokeWidth = 6f
        checkPaint.alpha = (p * 255).toInt()
        canvas.drawCircle(cx, cy, ringR, checkPaint)

        // Emerald checkmark
        if (p > 0.3f) {
            val checkP = ((p - 0.3f) / 0.7f).coerceIn(0f, 1f)
            val path = Path().apply {
                val leftX = cx - ringR * 0.38f
                val leftY = cy + ringR * 0.02f
                val midX = cx - ringR * 0.08f
                val midY = cy + ringR * 0.32f
                val rightX = cx + ringR * 0.38f
                val rightY = cy - ringR * 0.28f

                moveTo(leftX, leftY)
                if (checkP <= 0.4f) {
                    val sub = checkP / 0.4f
                    lineTo(leftX + (midX - leftX) * sub, leftY + (midY - leftY) * sub)
                } else {
                    lineTo(midX, midY)
                    val sub = (checkP - 0.4f) / 0.6f
                    lineTo(midX + (rightX - midX) * sub, midY + (rightY - midY) * sub)
                }
            }
            canvas.drawPath(path, checkPaint)
        }
    }
}
