package com.recover.installer

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.sin

/**
 * Animated thinking orbs loader inspired by Jakubantalik/thinking-orbs.
 * Renders an organic cluster of breathing, orbiting particles around a glowing core.
 * Smoothly transitions from the active "Updating..." state into the completed "Updated!" state.
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

    // Palette: Recover Sky Blue, Soft Electric Cyan, Pure White, Emerald Success
    private val colorCore = Color.parseColor("#028BFF")
    private val colorCyan = Color.parseColor("#38BDF8")
    private val colorWhite = Color.WHITE
    private val colorSuccess = Color.parseColor("#10B981")

    private val corePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val glowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val orbPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val checkPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    // Hand-tuned satellite orb parameters (distance, size, speed, phase, color)
    private data class Orb(
        val baseAngle: Float,
        val baseDist: Float,
        val radius: Float,
        val speed: Float,
        val phase: Float,
        val color: Int
    )

    private val orbs = listOf(
        Orb(baseAngle = 0f, baseDist = 32f, radius = 7f, speed = 1.2f, phase = 0f, color = colorWhite),
        Orb(baseAngle = 1.05f, baseDist = 42f, radius = 5.5f, speed = -0.9f, phase = 1.2f, color = colorCyan),
        Orb(baseAngle = 2.1f, baseDist = 36f, radius = 8f, speed = 1.0f, phase = 2.4f, color = colorCore),
        Orb(baseAngle = 3.14f, baseDist = 48f, radius = 5f, speed = -1.4f, phase = 3.6f, color = colorCyan),
        Orb(baseAngle = 4.2f, baseDist = 34f, radius = 6.5f, speed = 1.1f, phase = 4.8f, color = colorWhite),
        Orb(baseAngle = 5.2f, baseDist = 44f, radius = 6f, speed = -0.8f, phase = 0.8f, color = colorCore)
    )

    init {
        setupAnimators()
    }

    private fun setupAnimators() {
        animator = ValueAnimator.ofFloat(0f, 1000f).apply {
            duration = 300000L // Continuous smooth clock
            interpolator = LinearInterpolator()
            repeatCount = ValueAnimator.INFINITE
            addUpdateListener {
                animTime = it.animatedValue as Float
                postInvalidateOnAnimation()
            }
        }
    }

    fun startUpdating() {
        currentState = State.UPDATING
        completionProgress = 0f
        visibility = VISIBLE
        animator?.cancel()
        animator?.start()
        invalidate()
    }

    fun setCompleted() {
        currentState = State.COMPLETED
        completionAnimator?.cancel()
        completionAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 550L
            addUpdateListener {
                completionProgress = it.animatedValue as Float
                postInvalidateOnAnimation()
            }
        }
        completionAnimator?.start()
    }

    fun reset() {
        currentState = State.IDLE
        animator?.cancel()
        completionAnimator?.cancel()
        visibility = GONE
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val density = resources.displayMetrics.density
        val defaultSize = (160 * density).toInt()
        val w = resolveSize(defaultSize, widthMeasureSpec)
        val h = resolveSize(defaultSize, heightMeasureSpec)
        setMeasuredDimension(w, h)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        if (currentState == State.IDLE) return

        val cx = width / 2f
        val cy = height / 2f
        if (cx <= 0f || cy <= 0f) return
        val density = resources.displayMetrics.density

        if (currentState == State.UPDATING) {
            drawUpdatingOrbs(canvas, cx, cy, density)
        } else if (currentState == State.COMPLETED) {
            drawCompletedState(canvas, cx, cy, density)
        }
    }

    private fun drawUpdatingOrbs(canvas: Canvas, cx: Float, cy: Float, density: Float) {
        val t = animTime * 0.05f

        // 1. Ambient pulsing background glow
        val glowRadius = max(4f * density, (44f + 8f * sin(t * 1.5f)) * density)
        glowPaint.color = Color.argb(45, 2, 139, 255)
        canvas.drawCircle(cx, cy, glowRadius, glowPaint)

        // 2. Central breathing nucleus orb
        val coreRadius = max(3f * density, (16f + 3f * sin(t * 2.2f)) * density)
        corePaint.shader = RadialGradient(
            cx, cy, coreRadius,
            intArrayOf(colorWhite, colorCore),
            floatArrayOf(0.2f, 1.0f),
            Shader.TileMode.CLAMP
        )
        canvas.drawCircle(cx, cy, coreRadius, corePaint)

        // 3. Orbiting thinking orbs with harmonic weaving
        for (orb in orbs) {
            val angle = orb.baseAngle + t * orb.speed
            val breathingDist = (orb.baseDist + 7f * sin(t * 1.8f + orb.phase)) * density
            val ox = cx + cos(angle) * breathingDist
            val oy = cy + sin(angle) * breathingDist
            val orbR = max(1f * density, orb.radius * density * (0.85f + 0.25f * sin(t * 2.5f + orb.phase)))

            // Soft aura
            glowPaint.color = Color.argb(60, Color.red(orb.color), Color.green(orb.color), Color.blue(orb.color))
            canvas.drawCircle(ox, oy, orbR * 1.8f, glowPaint)

            // Solid orb core
            orbPaint.color = orb.color
            canvas.drawCircle(ox, oy, orbR, orbPaint)
        }
    }

    private fun drawCompletedState(canvas: Canvas, cx: Float, cy: Float, density: Float) {
        val p = completionProgress

        // Expanding victory ring
        val ringRadius = max(5f * density, (32f + 6f * p) * density)
        checkPaint.strokeWidth = 3.5f * density
        checkPaint.color = colorSuccess
        canvas.drawCircle(cx, cy, ringRadius, checkPaint)

        // Soft green ambient fill
        glowPaint.color = Color.argb((40 * p).toInt(), 16, 185, 129)
        canvas.drawCircle(cx, cy, ringRadius, glowPaint)

        // Checkmark stroke
        if (p > 0.25f) {
            val checkP = ((p - 0.25f) / 0.75f).coerceIn(0f, 1f)
            val path = Path().apply {
                val startX = cx - 12f * density
                val startY = cy + 1f * density
                val midX = cx - 3f * density
                val midY = cy + 10f * density
                val endX = cx + 14f * density
                val endY = cy - 8f * density

                moveTo(startX, startY)
                if (checkP <= 0.45f) {
                    val subP = checkP / 0.45f
                    lineTo(startX + (midX - startX) * subP, startY + (midY - startY) * subP)
                } else {
                    lineTo(midX, midY)
                    val subP = (checkP - 0.45f) / 0.55f
                    lineTo(midX + (endX - midX) * subP, midY + (endY - midY) * subP)
                }
            }
            checkPaint.color = Color.WHITE
            checkPaint.strokeWidth = 4f * density
            canvas.drawPath(path, checkPaint)
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        animator?.cancel()
        completionAnimator?.cancel()
    }
}
